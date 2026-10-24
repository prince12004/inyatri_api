import Joi from "joi";

const schema = {
  listBookingsQuery: Joi.object({
    status: Joi.string()
      .valid("all", "upcoming", "completed", "cancelled")
      .default("all"),
    trip_type: Joi.string()
      .valid(
        "all",
        "self_drive",
        "one_way",
        "round_trip",
        "local",
        "local_rental",
        "airport"
      )
      .default("all"),
    category: Joi.string().valid("all", "cab", "self_drive").optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),

  bookingDetailParams: Joi.object({
    id: Joi.string().required(),
  }),

  bookingDetailQuery: Joi.object({
    type: Joi.string().valid("cab", "self_drive").optional(),
    category: Joi.string().valid("cab", "self_drive").optional(),
  }),
};

export default schema;
