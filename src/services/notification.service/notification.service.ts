import { Expo } from "expo-server-sdk";
import { ExpoToken } from "../../models/notification/expoToken.model";
import {
  INotification,
  Notification,
  Priority,
} from "../../models/notification/notification.model";
import { IUser } from "../../models/user/user.model";
import { notificationSettings } from "../../utils/notificationSettings";
import axios from "axios";

export interface ICreateNotification {
  message: string;
  priority: Priority;
  user: string;
  relatedId?: string;
  relatedType?: string;
}

export interface INotificationSettingsUpdate {
  email?: boolean;
  push?: boolean;
  [key: string]: any;
}

let expo = new Expo();

export class NotificationService {
  static async createNotification(notificationFields: ICreateNotification) {
    try {
      const newNotification = new Notification();
      newNotification.message = notificationFields.message;
      newNotification.priority = notificationFields.priority;
      newNotification.user = notificationFields.user;

      if (notificationFields.relatedId) {
        newNotification.relatedId = notificationFields.relatedId;
      }
      if (notificationFields.relatedType) {
        newNotification.relatedType = notificationFields.relatedType;
      }
      await newNotification.save();
      return newNotification;
    } catch (error) {
      throw error;
    }
  }

  static async registerForPushNotifications(
    userId: string,
    expoPushToken: string,
    token: string
  ) {
    try {
      const existingExpoToken = await ExpoToken.findOne({
        user: userId,
      });

      if (existingExpoToken) {
        return existingExpoToken;
      }
      const newExpoToken = await ExpoToken.create({
        user: userId,
        expoToken: expoPushToken,
        sessionID: token,
      });
      await newExpoToken.save();
      return newExpoToken;
    } catch (error) {
      throw error;
    }
  }

  static async createNotificationSettings(user: IUser) {
    try {
      if (user.notificationSettings) return user.notificationSettings;
      user.notificationSettings = notificationSettings;
      await user.save();
      return user.notificationSettings;
    } catch (error) {
      throw error;
    }
  }
  static async sendNotificationToUser(
    user: IUser,
    message: string,
    title: string,
    data: any
  ) {
    const settings = user.notificationSettings;

    if (!settings || !settings["push"]) {
      console.log("user has opted out of receiving this notification type");
      return;
    }
    const userTokens = await ExpoToken.find({
      user: user._id,
    });
    if (userTokens.length === 0) {
      console.log("User has no registered devices");
      return;
    }
    let messages = [];
    for (let expoToken of userTokens) {
      if (!Expo.isExpoPushToken(expoToken.expoToken)) {
        console.error(
          `Push token ${expoToken.expoToken} is not a valid Expo push token`
        );
        continue;
      }

      messages.push({
        to: expoToken.expoToken,
        title,
        subtitle: message,
        body: message,
        data: { user, notificationID: data },
      });
    }

    let chunks = expo.chunkPushNotifications(
      messages.map((message) => ({
        ...message,
        sound: "default",
      }))
    );

    let tickets = [];
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log("ticketChunk", ticketChunk);
        tickets.push(...ticketChunk);
        for (let ticket of ticketChunk) {
          if (
            ticket.status === "error" &&
            ticket.details?.error === "DeviceNotRegistered"
          ) {
            //remove token from db to prevent sending notifications to uninstalled devices
            await ExpoToken.deleteOne({
              expoToken: (ticket.details as any).expoPushToken,
            });
          }
        }
      } catch (error) {
        console.error(error.message);
      }
    }
    return tickets;
  }

  static async getNotificationById(id: number) {
    try {
      const notification = await Notification.findOne({
        _id: id,
      }).populate("user");

      return notification;
    } catch (error) {
      throw error;
    }
  }

  static async readNotification(notification: INotification) {
    try {
      notification.isOpened = true;
      await notification.save();
      return notification;
    } catch (error) {
      throw error;
    }
  }

  static async getAllNotificationsForUser(userId: string) {
    try {
      const notifications = await Notification.find({
        user: userId,
      }).sort({ createdAt: -1 });
      return notifications;
    } catch (error) {
      throw error;
    }
  }
  static async updateNotificationSettings(
    user: IUser,
    settingsUpdate: INotificationSettingsUpdate
  ) {
    try {
      const settings = user.notificationSettings;

      if (!settings) {
        return await this.createNotificationSettings(user);
      }

      for (const key in settingsUpdate) {
        if (settingsUpdate.hasOwnProperty(key)) {
          settings.set(key, settingsUpdate[key]);
        }
      }

      await user.save();
      return settings;
    } catch (error) {
      throw error;
    }
  }

  static async sendSmsToUser(message: string, mobiles: string) {
    try {
      const username = process.env.SMS_API_USERNAME || "";
      const password = process.env.SMS_API_PASSWORD || "";
      const sender = process.env.SMS_API_SENDER || "";

      const formattedMessage = message.replace(/ /g, "_");
      const endpoint = `https://kullsms.com/customer/api/?username=${username}&password=${password}&message=${encodeURIComponent(
        formattedMessage
      )}&sender=${encodeURIComponent(sender)}&mobiles=${mobiles}`;
      const response = await axios.post(endpoint);

      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
