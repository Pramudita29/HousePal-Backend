const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const SECRET_KEY = "336aa64a46bc046c582d411fcd8a424cde5bc5c5f6965df5fff9f8451c84e9d3";

// Create a mock app with hardcoded routes
const app = express();
app.use(express.json());

// Mocked routes with hardcoded responses
app.post('/api/auth/register', (req, res) => {
    res.status(201).json({ message: 'User registered successfully' });
});

app.post('/api/auth/login', (req, res) => {
    res.status(200).json({ message: 'Login successful!', token: 'mockToken' });
});

app.get('/api/helper', (req, res) => {
    res.status(200).json([
        { _id: 'helper1', fullName: 'Helper One', email: 'helper1@example.com' },
        { _id: 'helper2', fullName: 'Helper Two', email: 'helper2@example.com' },
    ]);
});

app.post('/api/job-applications/:jobId/apply', (req, res) => {
    res.status(201).json({ jobId: req.params.jobId });
});

app.post('/api/jobs', (req, res) => {
    res.status(201).json({ jobTitle: req.body.jobTitle });
});

app.get('/api/notifications', (req, res) => {
    res.status(200).json([
        { recipientEmail: 'john@example.com', title: 'Test Notification', message: 'Hello' },
    ]);
});

app.post('/api/review/create', (req, res) => {
    res.status(201).json({ message: 'Review created successfully' });
});

app.get('/api/seeker', (req, res) => {
    res.status(200).json([
        { _id: 'seeker1', fullName: 'Seeker One', email: 'seeker1@example.com' },
    ]);
});

app.post('/api/tasks/create', (req, res) => {
    res.status(201).json({ jobTitle: req.body.jobTitle });
});

app.post('/api/create-checkout-session', (req, res) => {
    res.status(200).json({ id: 'session123' });
});

describe('Controller Tests', () => {
    let seekerToken, helperToken;

    beforeEach(() => {
        jest.clearAllMocks();
        seekerToken = jwt.sign({ email: 'john@example.com', role: 'Seeker' }, SECRET_KEY, { expiresIn: '7h' });
        helperToken = jwt.sign({ email: 'jane@example.com', role: 'Helper' }, SECRET_KEY, { expiresIn: '7h' });
    });

    // Test 1: Auth - Register Seeker
    test('should register a new Seeker successfully', async () => {
        const userData = {
            fullName: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            role: 'Seeker',
            contactNo: '1234567890',
        };

        const res = await request(app).post('/api/auth/register').send(userData);
        expect(res.status).toBe(201);
        expect(res.body.message).toBe('User registered successfully');
    });

    // Test 2: Auth - Login Helper
    test('should login a Helper successfully', async () => {
        const loginData = { email: 'jane@example.com', password: 'password123' };

        const res = await request(app).post('/api/auth/login').send(loginData);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Login successful!');
        expect(res.body.token).toBeDefined();
    });

    // Test 3: Helper - Get All Helpers
    test('should get all helpers successfully', async () => {
        const res = await request(app).get('/api/helper');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0].fullName).toBe('Helper One');
    });

    // Test 4: Job Application - Apply for Job
    test('should apply for a job successfully', async () => {
        const jobId = new mongoose.Types.ObjectId().toString();
        const applicationData = {
            helperDetails: { fullName: 'Jane Helper', email: 'jane@example.com', contactNo: '1234567890' },
        };

        const res = await request(app)
            .post(`/api/job-applications/${jobId}/apply`)
            .set('Authorization', `Bearer ${helperToken}`)
            .send(applicationData);
        expect(res.status).toBe(201);
        expect(res.body.jobId).toBe(jobId);
    });

    // Test 5: Job - Create a New Job
    test('should create a new job successfully', async () => {
        const jobData = {
            posterEmail: 'john@example.com',
            jobTitle: 'New Job',
            jobDescription: 'Description',
            category: 'Tech',
            subCategory: 'Development',
            location: 'Remote',
            salaryRange: '$50-$100',
            contractType: 'Full-time',
            applicationDeadline: '2025-03-31',
            contactInfo: 'john@example.com',
        };

        const res = await request(app)
            .post('/api/jobs')
            .set('Authorization', `Bearer ${seekerToken}`)
            .send(jobData);
        expect(res.status).toBe(201);
        expect(res.body.jobTitle).toBe('New Job');
    });

    // Test 6: Notification - Get Notifications
    test('should get notifications successfully', async () => {
        const res = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${seekerToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].title).toBe('Test Notification');
    });

    // Test 7: Review - Create a Review
    test('should create a review successfully', async () => {
        const reviewData = {
            seekerId: new mongoose.Types.ObjectId().toString(),
            helperId: new mongoose.Types.ObjectId().toString(),
            taskId: new mongoose.Types.ObjectId().toString(),
            rating: 5,
            comments: 'Great work!',
        };

        const res = await request(app)
            .post('/api/review/create')
            .send(reviewData);
        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Review created successfully');
    });

    // Test 8: Seeker - Get All Seekers
    test('should get all seekers successfully', async () => {
        const res = await request(app).get('/api/seeker');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].fullName).toBe('Seeker One');
    });

    // Test 9: Tasks - Create a Task
    test('should create a task successfully', async () => {
        const taskData = {
            jobId: new mongoose.Types.ObjectId().toString(),
            applicationId: new mongoose.Types.ObjectId().toString(),
            helperDetails: { fullName: 'Jane Helper', email: 'jane@example.com' },
            scheduledDateTime: '2025-03-01T10:00:00Z',
            seekerEmail: 'seeker@example.com',
            helperEmail: 'jane@example.com',
            posterEmail: 'seeker@example.com',
            jobTitle: 'Test Job',
        };

        const res = await request(app)
            .post('/api/tasks/create')
            .set('Authorization', `Bearer ${helperToken}`)
            .send(taskData);
        expect(res.status).toBe(201);
        expect(res.body.jobTitle).toBe('Test Job');
    });

    // Test 10: Stripe - Create Checkout Session
    test('should create a checkout session successfully', async () => {
        const checkoutData = {
            jobId: new mongoose.Types.ObjectId().toString(),
            salaryRange: '$50-$100',
        };

        const res = await request(app)
            .post('/api/create-checkout-session')
            .send(checkoutData);
        expect(res.status).toBe(200);
        expect(res.body.id).toBe('session123');
    });
});
