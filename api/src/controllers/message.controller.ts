import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

export class MessageController {
  getMessages = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const messages = [
      {
        id: '1',
        sender: 'John Doe',
        subject: 'Welcome to ElimuConnect',
        content: 'Welcome to our platform!',
        read: false,
        createdAt: new Date()
      }
    ];

    res.status(StatusCodes.OK).json(
      new ApiResponse('Messages retrieved successfully', messages)
    );
  });

  sendMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { recipient, subject, content } = req.body;

    const message = {
      id: Date.now().toString(),
      sender: req.user?._id,
      recipient,
      subject,
      content,
      read: false,
      createdAt: new Date()
    };

    res.status(StatusCodes.CREATED).json(
      new ApiResponse('Message sent successfully', message)
    );
  });

  markAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { messageId } = req.params;

    res.status(StatusCodes.OK).json(
      new ApiResponse('Message marked as read')
    );
  });

  deleteMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { messageId } = req.params;

    res.status(StatusCodes.OK).json(
      new ApiResponse('Message deleted successfully')
    );
  });
}
