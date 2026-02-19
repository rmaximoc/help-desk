import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { technicianRoutes } from './technician.routes.js';
import { clientRoutes } from './client.routes.js';
import { serviceRoutes } from './service.routes.js';
import { ticketRoutes } from './ticket.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/technicians', technicianRoutes);
router.use('/clients', clientRoutes);
router.use('/services', serviceRoutes);
router.use('/tickets', ticketRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export { router };
