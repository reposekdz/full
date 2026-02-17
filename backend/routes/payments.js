const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const crypto = require('crypto');
const axios = require('axios'); // Required for real API calls

// Helper to generate unique reference number
function generateReference() {
    return 'PAY-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Helper to generate receipt number
function generateReceiptNumber() {
    return 'REC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Real Payment Gateway Service
class PaymentGatewayService {
    constructor(config) {
        this.config = config; // Config from DB or ENV
    }

    // ==========================================
    // MTN MOBILE MONEY INTEGRATION
    // ==========================================
    async initiateMTNPayment(paymentData) {
        const { amount, mobile_number, reference_number } = paymentData;

        // 1. Get Access Token
        const token = await this.getMTNToken();

        // 2. Request to Pay
        const subscriptionKey = process.env.REACT_APP_MTN_SUBSCRIPTION_KEY;
        const targetEnvironment = process.env.NODE_ENV === 'production' ? 'mtnrwanda' : 'mtnrwanda'; // Sandbox usually 'sandbox'

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_MTN_API_URL}/requesttopay`,
                {
                    amount: amount.toString(),
                    currency: "RWF",
                    externalId: reference_number,
                    payer: {
                        partyIdType: "MSISDN",
                        partyId: mobile_number
                    },
                    payerMessage: "School Fees Payment",
                    payeeNote: "Garden TVET School"
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Reference-Id': reference_number, // Unique UUID for transaction
                        'X-Target-Environment': targetEnvironment,
                        'Ocp-Apim-Subscription-Key': subscriptionKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // MTN Async flow: returns 202 Accepted. Status checked via callback or polling.
            return {
                success: true,
                gateway_reference: reference_number, // MTN uses the X-Reference-Id we sent
                transaction_id: reference_number,
                status: 'processing', // Momopay is async push
                payment_url: null,
                ussd_code: null, // Push notification
                message: 'Payment push notification sent to mobile number'
            };

        } catch (error) {
            console.error('MTN Payment Error:', error.response?.data || error.message);
            throw new Error('Failed to initiate MTN payment');
        }
    }

    async getMTNToken() {
        // Basic Auth with API User and API Key
        const apiUser = process.env.REACT_APP_MTN_API_USER;
        const apiKey = process.env.REACT_APP_MTN_API_KEY;
        const subscriptionKey = process.env.REACT_APP_MTN_SUBSCRIPTION_KEY;
        const auth = Buffer.from(`${apiUser}:${apiKey}`).toString('base64');

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_MTN_API_URL}/token/`,
                {},
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Ocp-Apim-Subscription-Key': subscriptionKey
                    }
                }
            );
            return response.data.access_token;
        } catch (error) {
            console.error('MTN Token Error:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with MTN Gateway');
        }
    }

    // ==========================================
    // AIRTEL MONEY INTEGRATION
    // ==========================================
    async initiateAirtelPayment(paymentData) {
        const { amount, mobile_number, reference_number } = paymentData;

        // 1. Get Access Token
        const token = await this.getAirtelToken();

        // 2. Push Payment
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_AIRTEL_API_URL}/payments`,
                {
                    reference: "Garden TVET Payment",
                    subscriber: {
                        country: "RW",
                        currency: "RWF",
                        msisdn: mobile_number
                    },
                    transaction: {
                        amount: amount,
                        country: "RW",
                        currency: "RWF",
                        id: reference_number
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Country': 'RW',
                        'X-Currency': 'RWF',
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                gateway_reference: response.data.data.transaction.id,
                transaction_id: reference_number,
                status: 'processing',
                message: 'Airtel Money push sent'
            };

        } catch (error) {
            console.error('Airtel Payment Error:', error.response?.data || error.message);
            throw new Error('Failed to initiate Airtel payment');
        }
    }

    async getAirtelToken() {
        const clientId = process.env.REACT_APP_AIRTEL_CLIENT_ID;
        const clientSecret = process.env.REACT_APP_AIRTEL_CLIENT_SECRET;

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_AIRTEL_API_URL}/auth/oauth2/token`,
                {
                    client_id: clientId,
                    client_secret: clientSecret,
                    grant_type: 'client_credentials'
                },
                { headers: { 'Content-Type': 'application/json' } }
            );
            return response.data.access_token;
        } catch (error) {
            console.error('Airtel Token Error:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with Airtel Gateway');
        }
    }

    // ==========================================
    // STRIPE / CARD INTEGRATION (Placeholder)
    // ==========================================
    async initiateCardPayment(paymentData) {
        // Logic for Stripe would go here using 'stripe' package
        // requires: const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        // Returning a link for now as we focus on Mobile Money
        return {
            success: true,
            gateway_reference: 'STRIPE-' + Date.now(),
            transaction_id: paymentData.reference_number,
            payment_url: `https://checkout.stripe.com/pay/${paymentData.reference_number}`,
            status: 'pending',
            message: 'Redirect to card payment'
        };
    }

    // Main Entry Point
    async initiatePayment(paymentData) {
        if (paymentData.payment_method.toLowerCase().includes('mtn')) {
            return this.initiateMTNPayment(paymentData);
        } else if (paymentData.payment_method.toLowerCase().includes('airtel')) {
            return this.initiateAirtelPayment(paymentData);
        } else {
            return this.initiateCardPayment(paymentData);
        }
    }
}

// POST /api/payments/initiate - Initiate payment
router.post('/initiate', async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const {
            parent_id,
            student_id,
            amount,
            payment_type,
            payment_method,
            academic_year,
            term,
            mobile_number,
            description
        } = req.body;

        // Validation
        if (!parent_id || !student_id || !amount || !payment_type || !payment_method) {
            throw new Error('Missing required fields');
        }

        if (amount <= 0) {
            throw new Error('Invalid payment amount');
        }

        // Verify parent-student link
        const [linkCheck] = await connection.execute(
            'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ? AND status = "active"',
            [parent_id, student_id]
        );

        if (linkCheck.length === 0) {
            throw new Error('Parent is not linked to this student');
        }

        // Generate unique reference
        const reference = generateReference();

        // Insert payment record
        const [paymentResult] = await connection.execute(`
      INSERT INTO payments (
        reference_number, parent_id, student_id, amount, currency,
        payment_type, payment_method, mobile_number, academic_year, term,
        description, status, created_at, initiated_at
      ) VALUES (?, ?, ?, ?, 'RWF', ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
    `, [
            reference, parent_id, student_id, amount,
            payment_type, payment_method, mobile_number,
            academic_year, term, description
        ]);

        const paymentId = paymentResult.insertId;

        // Instantiate Gateway Service (Uses .env credentials internally)
        const gateway = new PaymentGatewayService({});

        // Initiate Real Payment
        const gatewayResponse = await gateway.initiatePayment({
            reference_number: reference,
            amount,
            payment_method,
            mobile_number,
            student_id,
            parent_id
        });

        // Update payment with gateway response
        await connection.execute(`
        UPDATE payments
        SET gateway_reference = ?,
            transaction_id = ?,
            payment_url = ?,
            ussd_code = ?,
            gateway_response = ?,
            status = 'processing',
            processing_at = NOW()
        WHERE id = ?
    `, [
            gatewayResponse.gateway_reference,
            gatewayResponse.transaction_id,
            gatewayResponse.payment_url,
            gatewayResponse.ussd_code,
            JSON.stringify(gatewayResponse),
            paymentId
        ]);

        await connection.commit();

        res.status(201).json({
            success: true,
            message: gatewayResponse.message || 'Payment initiated successfully',
            payment: {
                id: paymentId,
                reference_number: reference,
                amount,
                payment_method,
                gateway_reference: gatewayResponse.gateway_reference,
                payment_url: gatewayResponse.payment_url,
                ussd_code: gatewayResponse.ussd_code,
                status: 'processing'
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Payment initiation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to initiate payment'
        });
    } finally {
        connection.release();
    }
});

// POST /api/payments/callback - Payment gateway webhook
router.post('/callback', async (req, res) => {
    try {
        const callbackData = req.body;

        // NOTE: In production, verify signature here (e.g. X-Callback-Signature)

        // Log the callback
        const [paymentCheck] = await pool.execute(
            'SELECT id, amount, status FROM payments WHERE gateway_reference = ? OR reference_number = ?',
            [callbackData.resourceId || callbackData.transaction_id, callbackData.externalId]
            // MTN returns resourceId, Airbnb/Stripe might return diff fields. Adjust match logic.
        );

        if (paymentCheck.length === 0) {
            // Log orphan callback
            console.warn('Orphan callback received:', callbackData);
            return res.status(200).json({ received: true }); // Acknowledge anyway
        }

        const payment = paymentCheck[0];
        const paymentId = payment.id;

        // Insert callback log
        await pool.execute(`
      INSERT INTO payment_callbacks (
        payment_id, callback_type, gateway_name, request_body, received_at
      ) VALUES (?, 'status_update', ?, ?, NOW())
    `, [paymentId, 'mtn_callback', JSON.stringify(callbackData)]);

        // Determine Status (MTN Specific Logic Example)
        let newStatus = payment.status;
        let errorMessage = null;

        if (callbackData.status === 'SUCCESSFUL' || callbackData.status === 'TS' || callbackData.transaction_status === 'Success') {
            newStatus = 'completed';
        } else if (callbackData.status === 'FAILED' || callbackData.status === 'TF') {
            newStatus = 'failed';
            errorMessage = callbackData.reason || 'Transaction failed';
        }

        if (newStatus === 'completed' && payment.status !== 'completed') {
            // Generate receipt
            const receiptNumber = generateReceiptNumber();

            await pool.execute(`
        UPDATE payments
        SET status = 'completed',
            receipt_number = ?,
            completed_at = NOW()
        WHERE id = ?
      `, [receiptNumber, paymentId]);

            // Trigger in DB updates student_fees automatically
        } else if (newStatus === 'failed') {
            await pool.execute(`
        UPDATE payments
        SET status = 'failed',
            failed_at = NOW(),
            error_message = ?
        WHERE id = ?
      `, [errorMessage, paymentId]);
        }

        res.json({ success: true, message: 'Callback processed' });

    } catch (error) {
        console.error('Callback processing error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/payments/history/recent - Get recent payments (Accountant Dashboard)
router.get('/history/recent', async (req, res) => {
    try {
        const [payments] = await pool.execute(`
            SELECT 
                p.*,
                CONCAT(s.first_name, ' ', s.last_name) as student_name,
                s.student_id as student_code
            FROM payments p
            JOIN users s ON p.student_id = s.id
            ORDER BY p.created_at DESC
            LIMIT 5
        `);
        res.json({ success: true, payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/payments/history/:parentId - Get payment history for parent
router.get('/history/:parentId', async (req, res) => {
    try {
        const { parentId } = req.params;

        const [payments] = await pool.execute(`
      SELECT 
        p.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.trade_code,
        s.level
      FROM payments p
      JOIN users s ON p.student_id = s.id
      WHERE p.parent_id = ?
      ORDER BY p.created_at DESC
    `, [parentId]);

        res.json({
            success: true,
            payments
        });

    } catch (error) {
        console.error('Payment history error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/payments/status/:reference - Check payment status
router.get('/status/:reference', async (req, res) => {
    try {
        const { reference } = req.params;

        const [payment] = await pool.execute(
            'SELECT * FROM payments WHERE reference_number = ?',
            [reference]
        );

        if (payment.length === 0) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        res.json({
            success: true,
            payment: payment[0]
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/payments/all - Get all payments (Accountant/Admin)
router.get('/all', async (req, res) => {
    try {
        const { start_date, end_date, student_id, status } = req.query;

        let query = `
      SELECT 
        p.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.student_id as student_code,
        s.trade_code,
        s.level,
        CONCAT(par.first_name, ' ', par.last_name) as parent_name,
        par.phone as parent_phone
      FROM payments p
      JOIN users s ON p.student_id = s.id
      JOIN users par ON p.parent_id = par.id
      WHERE 1=1
    `;

        const params = [];

        if (start_date) {
            query += ' AND p.created_at >= ?';
            params.push(start_date);
        }

        if (end_date) {
            query += ' AND p.created_at <= ?';
            params.push(end_date);
        }

        if (status) {
            query += ' AND p.status = ?';
            params.push(status);
        }

        query += ' ORDER BY p.created_at DESC LIMIT 1000';

        const [payments] = await pool.execute(query, params);

        res.json({
            success: true,
            payments
        });

    } catch (error) {
        console.error('Fetch all payments error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/payments/student-fees/:studentId - Get fee structure for student
router.get('/student-fees/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const { academic_year, term } = req.query;

        const [fees] = await pool.execute(`
      SELECT * FROM student_fees
      WHERE student_id = ?
        AND academic_year = COALESCE(?, academic_year)
        AND term = COALESCE(?, term)
      ORDER BY academic_year DESC, term DESC
      LIMIT 1
    `, [studentId, academic_year, term]);

        if (fees.length === 0) {
            // Return default fee structure if none exists
            return res.json({
                success: true,
                fees: {
                    tuition_amount: 150000,
                    exam_fees: 20000,
                    uniform_fees: 30000,
                    lab_fees: 25000,
                    total_amount: 225000,
                    paid_amount: 0,
                    balance: 225000,
                    payment_status: 'not_started'
                }
            });
        }

        res.json({
            success: true,
            fees: fees[0]
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/payments/receipt/:paymentId - Download receipt
router.get('/receipt/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;

        const [payment] = await pool.execute(`
      SELECT 
        p.*,
        CONCAT(par.first_name, ' ', par.last_name) as parent_name,
        par.email as parent_email,
        par.phone as parent_phone,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.student_id as student_code,
        s.trade_code,
        s.level
      FROM payments p
      JOIN users par ON p.parent_id = par.id
      JOIN users s ON p.student_id = s.id
      WHERE p.id = ? AND p.status = 'completed'
    `, [paymentId]);

        if (payment.length === 0) {
            return res.status(404).json({ success: false, message: 'Receipt not found' });
        }

        // Return receipt data (in real app, generate PDF)
        res.json({
            success: true,
            receipt: {
                ...payment[0],
                school_name: 'Garden TVET School',
                school_address: 'Kigali, Rwanda',
                receipt_date: new Date().toISOString()
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/payments/statistics/summary - Financial Summary
router.get('/statistics/summary', async (req, res) => {
    try {
        const [stats] = await pool.execute(`
            SELECT 
                COALESCE(SUM(total_fees), 0) as total_fees,
                COALESCE(SUM(paid_amount), 0) as total_paid,
                COALESCE(SUM(balance), 0) as total_balance,
                SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_students,
                SUM(CASE WHEN payment_status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_students,
                COUNT(*) as total_students
            FROM global_student_sheets
            WHERE academic_year = (SELECT current_academic_year FROM system_settings LIMIT 1)
        `);

        // Get daily collection
        const [daily] = await pool.execute(`
            SELECT COALESCE(SUM(amount), 0) as amount 
            FROM payments 
            WHERE status = 'completed' 
            AND DATE(completed_at) = CURDATE()
        `);

        res.json({
            success: true,
            summary: {
                ...stats[0],
                daily_collection: daily[0].amount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/payments/statistics/trends - Monthly Trends
router.get('/statistics/trends', async (req, res) => {
    try {
        const [trends] = await pool.execute(`
            SELECT 
                DATE_FORMAT(completed_at, '%b') as month,
                SUM(amount) as collected,
                COUNT(*) as transactions
            FROM payments
            WHERE status = 'completed'
            AND completed_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month
            ORDER BY MIN(completed_at)
        `);
        res.json({ success: true, trends });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/payments/statistics/methods - Payment Methods Breakdown
router.get('/statistics/methods', async (req, res) => {
    try {
        const [methods] = await pool.execute(`
            SELECT 
                payment_method as name,
                SUM(amount) as value,
                COUNT(*) as count
            FROM payments
            WHERE status = 'completed'
            GROUP BY payment_method
        `);
        res.json({ success: true, methods });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
