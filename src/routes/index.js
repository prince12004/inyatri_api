// Main router
// health route

import express from 'express';
const router = express.Router();


// Routes
import userRoutes from "./user/index.js";
import adminRoutes from "./admin/index.js";


/******************** health ********************/
router.get('/health', (req, res) => {
    res.send("Health Ok")
});

// API routes

router.use('/api/user/v1', userRoutes);
router.use('/api/admin/v1', adminRoutes);



export default router;