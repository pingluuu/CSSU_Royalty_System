const authService = require('../services/authService');

const authenticate = async (req, res) => {
    const { utorid, password } = req.body;

    if (!utorid || !password) {
        return res.status(400).json({ error: 'UTORid and password are required' });
    }

    try {
        console.log(req.body);
        const result = await authService.authenticateUser(utorid, password);

        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.error || "Internal server ERROR" });
    }
};

const requestPasswordReset = async (req, res) => {
    const { utorid } = req.body;

    if (!utorid) {
        return res.status(400).json({ error: 'UTORid is required' });
    }

    try {
        const { expiresAt, resetToken } = await authService.requestPasswordReset(utorid);
        return res.status(202).json({ expiresAt, resetToken });
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.error || "Internal server error" });
    }
};

const resetPassword = async (req, res) => {
    const { resetToken } = req.params;
    const { utorid, password } = req.body;

    if (!utorid || !password) {
        return res.status(400).json({ error: 'UTORid and password are required' });
    }

    try {
        const result = await authService.resetPassword(resetToken, utorid, password);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(error.status || 500).json({ error: error.error || 'Internal server error' });
    }
};

module.exports = { authenticate, requestPasswordReset, resetPassword };
