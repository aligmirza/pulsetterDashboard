import UserService from '../services/clients/userService.js';

const UserController = {
  list: async (req, res, next) => {
    try {
      const users = await UserService.list();
      return res.json({ data: users });
    } catch (err) {
      return next(err);
    }
  },
  create: async (req, res, next) => {
    try {
      const { email, name, password, role, client_id: clientId } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      const user = await UserService.create({ email, name, password, role, client_id: clientId });
      return res.status(201).json({ data: user });
    } catch (err) {
      return next(err);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await UserService.update(id, req.body);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json({ data: user });
    } catch (err) {
      return next(err);
    }
  },
  remove: async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await UserService.remove(id);
      if (!deleted) return res.status(404).json({ message: 'User not found' });
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  },
};

export default UserController;
