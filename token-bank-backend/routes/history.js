import express from 'express';
const router = express.Router();

// 定义路由
router.get('/', (req, res) => {
  res.send('History endpoint');
});

export default router;
