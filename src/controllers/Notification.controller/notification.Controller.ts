import { Response } from "express";
import { CustomRequest } from "../../middlewares/auth";
import { INotificationSettingsUpdate, NotificationService } from "../../services/notification.service/notification.service";

export class NotificationController {
  static async registerForPushNotifications(req: CustomRequest, res: Response) {
    const expoPushToken = req.body.expoPushToken;
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!expoPushToken) {
      return res.status(400).send({
        error: 'expoPushToken is required',
      });
    }
    try {
      await NotificationService.registerForPushNotifications(req.user!._id, expoPushToken, token!);

      return res.status(200).send({
        message: 'Registered for notifications successfully'
      });
    } catch (error) {
      console.log(error.message)
      return res.status(500).send({
        error: "An unexpected error occurred"
      })
    }
  }
  static async readNotification(req: CustomRequest, res: Response) {
    const notifcationID = parseInt(req.params.id);
    try {
      const notification = await NotificationService.getNotificationById(notifcationID);
      if (!notification) {
        return res.status(404).send({
          error: 'Notification not found',
        });
      }

      if (notification.user.toString() !== req.user!._id.toString()) {
        return res.status(401).send({
          error: 'Unauthorized to read this notification',
        });
      }
      const readNotification = await NotificationService.readNotification(notification!);

      return res.status(200).send({
        message: 'Notification read successfully',
        data: readNotification,
      });
    } catch (error) {
      console.log(error.message)
      return res.status(500).send({
        error: "An unexpected error occurred"
      })
    }
  }

  static async getAllNotificationsForUser(req: CustomRequest, res: Response) {
    try {
      const notifications = await NotificationService.getAllNotificationsForUser(req.user!._id);
      return res.status(200).send({
        message: 'Notifications fetched successfully',
        data: notifications,
      });

    } catch (error) {
      console.log(error.message)
      return res.status(500).send({
        error: "An unexpected error occurred"
      })
    }
  }
}