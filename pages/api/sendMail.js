const nodemailer = require("nodemailer");
import validator from 'validator';

import { recordContactAttempt } from '../../lib/dashboardStore';

const GENERIC_DELIVERY_ERROR_MESSAGE = 'Message delivery failed.';

function getRequestIpAddress(req) {
    const forwardedForHeader = req.headers['x-forwarded-for'];

    if (typeof forwardedForHeader === 'string') {
        return forwardedForHeader.split(',')[0]?.trim() ?? null;
    }

    if (Array.isArray(forwardedForHeader)) {
        return forwardedForHeader[0]?.trim() ?? null;
    }

    return req.socket.remoteAddress ?? null;
}

export default async function handler(req, res) {
    const { USER_EMAIL, USER_PASS } = process.env;

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed.' });
    }

    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    const ip = getRequestIpAddress(req);
    const userAgent = req.headers['user-agent'] ?? null;

    if (name.length < 2) {
        return res.status(400).json({ message: 'Please provide a valid name.' });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (text.length < 10) {
        return res.status(400).json({ message: 'Please write a longer message.' });
    }

    if (!USER_EMAIL || !USER_PASS) {
        console.error('Contact email service is not configured.');

        await recordContactAttempt({
            name,
            email,
            message: text,
            status: 'failed',
            ip,
            userAgent,
            errorMessage: GENERIC_DELIVERY_ERROR_MESSAGE,
        });

        return res.status(500).json({ message: 'Could not send the message.' });
    }

    const transporter = nodemailer.createTransport({
            host: "smtp.zoho.eu",
            port: 465,
            secure: true,
            auth: {
                user: `${USER_EMAIL}`,
                pass: `${USER_PASS}`
            },
          });

    const mailOption = {
            from: '<me@weslleyoliveira.com>',
            to: `me@weslleyoliveira.com`,
            subject: `New contact from ${email}`,
            html: `
              <h1>${name}</h1>
              <p>${text}</p>
              <p>${email}</p>
              `,
          };

    try {
        await transporter.sendMail(mailOption);

        await recordContactAttempt({
            name,
            email,
            message: text,
            status: 'sent',
            ip,
            userAgent,
        });

        return res.status(200).json({ message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Contact email delivery failed:', error);

        await recordContactAttempt({
            name,
            email,
            message: text,
            status: 'failed',
            ip,
            userAgent,
            errorMessage: GENERIC_DELIVERY_ERROR_MESSAGE,
        });

        return res.status(500).json({ message: 'Could not send the message.' });
    }
}
