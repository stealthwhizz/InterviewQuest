import { describe, it, expect, beforeEach, vi } from 'vitest';
import { APIClient } from './apiClient.js';

describe('APIClient', () => {
    let apiClient;
    const mockEndpoint = 'https://api.example.com/evaluate';

    beforeEach(() => {
        apiClient = new APIClient(mockEndpoint);
        // Reset fetch mock
        global.fetch = vi.fn();
    });

    describe('evaluateAnswer', () => {
        it('should successfully evaluate an answer with valid inputs', async () => {
            const mockResponse = {
                score: 8,
                strengths: ['Clear explanation', 'Good examples'],
                improvements: ['Add more detail', 'Consider edge cases'],
                motivation: 'Great job!'
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await apiClient.evaluateAnswer(
                'What is React?',
                'React is a JavaScript library for building user interfaces',
                'junior'
            );

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                mockEndpoint,
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        question: 'What is React?',
                        answer: 'React is a JavaScript library for building user interfaces',
                        difficulty: 'junior'
                    })
                })
            );
        });

        it('should trim whitespace from question and answer', async () => {
            const mockResponse = {
                score: 7,
                strengths: ['Good'],
                improvements: ['Better'],
                motivation: 'Keep going!'
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            await apiClient.evaluateAnswer(
                '  What is React?  ',
                '  React is a library  ',
                'junior'
            );

            const callBody = JSON.parse(global.fetch.mock.calls[0][1].body);
            expect(callBody.question).toBe('What is React?');
            expect(callBody.answer).toBe('React is a library');
        });

        it('should throw error for empty question', async () => {
            await expect(
                apiClient.evaluateAnswer('', 'Some answer', 'junior')
            ).rejects.toThrow('Question must be a non-empty string');
        });

        it('should throw error for empty answer', async () => {
            await expect(
                apiClient.evaluateAnswer('What is React?', '', 'junior')
            ).rejects.toThrow('Answer must be a non-empty string');
        });

        it('should throw error for invalid difficulty', async () => {
            await expect(
                apiClient.evaluateAnswer('What is React?', 'React is a library', 'invalid')
            ).rejects.toThrow('Difficulty must be one of: junior, senior, faang');
        });

        it('should handle network errors', async () => {
            // Mock fetch to reject with a TypeError (simulating network failure)
            global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

            await expect(
                apiClient.evaluateAnswer('What is React?', 'React is a library', 'junior')
            ).rejects.toThrow('Network error: Unable to connect to server');
        });

        it('should handle server errors with retry', async () => {
            const mockResponse = {
                score: 8,
                strengths: ['Good'],
                improvements: ['Better'],
                motivation: 'Nice!'
            };

            // First two attempts fail, third succeeds
            global.fetch
                .mockRejectedValueOnce(new Error('Server error'))
                .mockRejectedValueOnce(new Error('Server error'))
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockResponse
                });

            const result = await apiClient.evaluateAnswer(
                'What is React?',
                'React is a library',
                'junior'
            );

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledTimes(3);
        });

        it('should not retry on client errors (4xx)', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => ({ error: 'Bad request' })
            });

            await expect(
                apiClient.evaluateAnswer('What is React?', 'React is a library', 'junior')
            ).rejects.toThrow('Bad request');

            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('should throw error after max retries', async () => {
            global.fetch.mockRejectedValue(new Error('Server error'));

            await expect(
                apiClient.evaluateAnswer('What is React?', 'React is a library', 'junior')
            ).rejects.toThrow('Failed to evaluate answer after 3 attempts');

            expect(global.fetch).toHaveBeenCalledTimes(3);
        });

        it('should validate response has all required fields', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    score: 8,
                    strengths: ['Good']
                    // Missing improvements and motivation
                })
            });

            await expect(
                apiClient.evaluateAnswer('What is React?', 'React is a library', 'junior')
            ).rejects.toThrow("Invalid response: missing field 'improvements'");
        });

        it('should validate score is a number between 1 and 10', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    score: 15,
                    strengths: ['Good'],
                    improvements: ['Better'],
                    motivation: 'Nice!'
                })
            });

            await expect(
                apiClient.evaluateAnswer('What is React?', 'React is a library', 'junior')
            ).rejects.toThrow('Invalid response: score must be a number between 1 and 10');
        });

        it('should validate strengths is a non-empty array', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    score: 8,
                    strengths: [],
                    improvements: ['Better'],
                    motivation: 'Nice!'
                })
            });

            await expect(
                apiClient.evaluateAnswer('What is React?', 'React is a library', 'junior')
            ).rejects.toThrow('Invalid response: strengths must be a non-empty array');
        });

        it('should validate improvements is a non-empty array', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    score: 8,
                    strengths: ['Good'],
                    improvements: [],
                    motivation: 'Nice!'
                })
            });

            await expect(
                apiClient.evaluateAnswer('What is React?', 'React is a library', 'junior')
            ).rejects.toThrow('Invalid response: improvements must be a non-empty array');
        });

        it('should validate motivation is a non-empty string', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    score: 8,
                    strengths: ['Good'],
                    improvements: ['Better'],
                    motivation: ''
                })
            });

            await expect(
                apiClient.evaluateAnswer('What is React?', 'React is a library', 'junior')
            ).rejects.toThrow('Invalid response: motivation must be a non-empty string');
        });

        it('should handle invalid JSON response', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => {
                    throw new Error('Invalid JSON');
                }
            });

            await expect(
                apiClient.evaluateAnswer('What is React?', 'React is a library', 'junior')
            ).rejects.toThrow('Invalid response format from server');
        });

        it('should work with all valid difficulty levels', async () => {
            const mockResponse = {
                score: 8,
                strengths: ['Good'],
                improvements: ['Better'],
                motivation: 'Nice!'
            };

            for (const difficulty of ['junior', 'senior', 'faang']) {
                global.fetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockResponse
                });

                const result = await apiClient.evaluateAnswer(
                    'What is React?',
                    'React is a library',
                    difficulty
                );

                expect(result).toEqual(mockResponse);
            }
        });
    });

    describe('getUserFriendlyError', () => {
        it('should return friendly message for network errors', () => {
            const error = new Error('Network error: Unable to connect');
            const message = APIClient.getUserFriendlyError(error);
            expect(message).toContain('Unable to connect to the server');
        });

        it('should return friendly message for timeout errors', () => {
            const error = new Error('Request timeout');
            const message = APIClient.getUserFriendlyError(error);
            expect(message).toContain('took too long');
        });

        it('should return friendly message for server errors', () => {
            const error = new Error('Server error');
            error.statusCode = 500;
            const message = APIClient.getUserFriendlyError(error);
            expect(message).toContain('server is experiencing issues');
        });

        it('should return friendly message for client errors', () => {
            const error = new Error('Bad request');
            error.statusCode = 400;
            const message = APIClient.getUserFriendlyError(error);
            expect(message).toBe('Bad request');
        });

        it('should return friendly message for validation errors', () => {
            const error = new Error('Invalid response: missing field');
            const message = APIClient.getUserFriendlyError(error);
            expect(message).toContain('unexpected response');
        });

        it('should return friendly message for retry exhaustion', () => {
            const error = new Error('Failed after 3 attempts');
            const message = APIClient.getUserFriendlyError(error);
            expect(message).toContain('multiple attempts');
        });

        it('should return default message for unknown errors', () => {
            const error = new Error('Unknown error');
            const message = APIClient.getUserFriendlyError(error);
            expect(message).toContain('error occurred');
        });

        it('should handle null error', () => {
            const message = APIClient.getUserFriendlyError(null);
            expect(message).toBe('An unknown error occurred');
        });
    });
});
