import { Op } from "sequelize";
import { User, Booking, CabBooking } from "../../models/index.js";
import ApiError from "../../utils/ApiError.js";

const formatAdminUser = (user, counts = {}) => {
  const data = user.toJSON ? user.toJSON() : { ...user };
  delete data.password;
  delete data.token;

  data.full_name = [data.firstname, data.lastname]
    .filter(Boolean)
    .join(" ")
    .trim();

  data.has_driving_license = Boolean(
    data.driving_license_front || data.driving_license_back
  );
  data.has_government_id = Boolean(data.government_id);
  data.documents_uploaded = data.has_driving_license && data.has_government_id;

  if (counts.self_drive_bookings_count !== undefined) {
    data.self_drive_bookings_count = counts.self_drive_bookings_count;
  }
  if (counts.cab_bookings_count !== undefined) {
    data.cab_bookings_count = counts.cab_bookings_count;
  }
  if (
    counts.self_drive_bookings_count !== undefined &&
    counts.cab_bookings_count !== undefined
  ) {
    data.total_bookings_count =
      counts.self_drive_bookings_count + counts.cab_bookings_count;
  }

  return data;
};

export const listUsers = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const offset = (page - 1) * limit;

  const where = {};

  if (query.status !== undefined) {
    where.status = parseInt(query.status, 10);
  }

  if (query.search?.trim()) {
    const s = `%${query.search.trim()}%`;
    where[Op.or] = [
      { firstname: { [Op.like]: s } },
      { lastname: { [Op.like]: s } },
      { mobile: { [Op.like]: s } },
      { email: { [Op.like]: s } },
    ];
  }

  if (query.has_documents === true || query.has_documents === "true") {
    where[Op.or] = [
      { driving_license_front: { [Op.ne]: null } },
      { government_id: { [Op.ne]: null } },
    ];
  } else if (query.has_documents === false || query.has_documents === "false") {
    where.driving_license_front = null;
    where.government_id = null;
  }

  const { rows, count } = await User.findAndCountAll({
    where,
    attributes: { exclude: ["password", "token"] },
    order: [["id", "DESC"]],
    limit,
    offset,
  });

  return {
    rows: rows.map((u) => formatAdminUser(u)),
    count,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      totalRecords: count,
    },
  };
};

export const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ["password", "token"] },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const [selfDriveCount, cabCount] = await Promise.all([
    Booking.count({ where: { user_id: id } }).catch(() => 0),
    CabBooking.count({ where: { user_id: id } }).catch(() => 0),
  ]);

  return formatAdminUser(user, {
    self_drive_bookings_count: selfDriveCount,
    cab_bookings_count: cabCount,
  });
};

export const updateUser = async (id, payload) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updates = {};
  const allowedFields = [
    "firstname",
    "lastname",
    "email",
    "mobile",
    "country_code",
    "dob",
    "city",
    "address",
    "picture",
    "driving_license_front",
    "driving_license_back",
    "government_id",
    "status",
  ];

  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      updates[field] = payload[field];
    }
  }

  if (Object.keys(updates).length > 0) {
    await user.update(updates);
    await user.reload();
  }

  return formatAdminUser(user);
};

export const updateUserStatus = async (id, status) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await user.update({ status });
  await user.reload();

  return formatAdminUser(user);
};

export const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Deactivate instead of destructive hard delete to preserve booking references
  await user.update({ status: User.STATUS.INACTIVE });
  return { message: "User account deactivated successfully", id: user.id };
};
