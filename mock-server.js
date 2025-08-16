const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mock data
const mockUser = {
  id: 'user123',
  name: 'Victor Pardo',
  email: 'victor@betforbes.com',
  referralCode: 'VICTOR123'
};

const mockStats = {
  totalReferrals: 0,
  activeReferrals: 0,
  totalEarnings: 0.00,
  referralLink: 'https://www.betforbes.com/cadastro?ref=VICTOR123'
};

const mockReferrals = [];

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    data: {
      user: mockUser,
      tokens: {
        accessToken: 'mock_access_token_12345',
        refreshToken: 'mock_refresh_token_67890'
      }
    }
  });
});

app.post('/api/auth/refresh', (req, res) => {
  res.json({
    success: true,
    data: {
      tokens: {
        accessToken: 'new_mock_access_token_12345',
        refreshToken: 'new_mock_refresh_token_67890'
      }
    }
  });
});

// Affiliate endpoints
app.get('/api/affiliate/link', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token não fornecido',
      code: 'UNAUTHORIZED'
    });
  }

  res.json({
    success: true,
    data: {
      referralLink: mockStats.referralLink,
      referralCode: mockUser.referralCode
    }
  });
});

app.get('/api/affiliate/stats', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token não fornecido',
      code: 'UNAUTHORIZED'
    });
  }

  res.json({
    success: true,
    data: mockStats
  });
});

app.get('/api/affiliate/referrals', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token não fornecido',
      code: 'UNAUTHORIZED'
    });
  }

  res.json({
    success: true,
    data: {
      referrals: mockReferrals,
      total: mockReferrals.length,
      page: 1,
      totalPages: 1
    }
  });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🚀 Mock server rodando na porta ${PORT}`);
  console.log(`📡 CORS habilitado para http://localhost:5173`);
});
