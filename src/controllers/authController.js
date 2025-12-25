import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import UserService from '../services/clients/userService.js';

const AuthController = {
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      const user = await UserService.verifyCredentials(email, password);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const payload = { id: user.id, email: user.email, role: user.role, client_id: user.client_id };
      const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
      return res.json({ token, role: user.role, client_id: user.client_id, name: user.name });
    } catch (err) {
      return next(err);
    }
  },
  me: async (req, res) => res.json({ user: req.user }),
};

export default AuthController;
