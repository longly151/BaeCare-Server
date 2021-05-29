import axios from "axios";
import * as Notifications from "expo-notifications";
import { Subscription } from '@unimodules/core';
import AsyncStorage from "@react-native-async-storage/async-storage";
import _ from "lodash";

const Global: any = global;

class CHelper {
  private static _instance: CHelper;

  private constructor() {
    // ...
  }

  public static get Instance(): CHelper {
    if (!this._instance) {
      this._instance = new this();
    }
    return CHelper._instance;
  }

  
  initNotification = async() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  requestPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
    }
  }

  getToken = async () => {
    const token = await Notifications.getExpoPushTokenAsync();
    console.log('Token: ', token);
    Global.token = token.data;
    return token.data;
  }

  sendNotification = async (token: string, title: string, body: string) => {
    // Reference: https://expo.io/notifications
    const EXPO_NOTIFICATION_URL = 'https://exp.host/--/api/v2/push/send';
    const message = {
      to: token,
      sound: 'default',
      title,
      body,
      data: {token: Global.token}
    }
  
    await axios.post(EXPO_NOTIFICATION_URL, message)
  }

  selectFields(collection: Array<any>, fields: Array<string> | string): Array<any> {
    if (typeof fields === 'string') {
      const result: any = [];
      collection.forEach((e: any) => {
        result.push(e[fields]);
      });
      return result;
    }
    const results =  _.map(collection, _.partialRight(_.pick, fields));
    return results.reverse();
  }

  subscribeNotification = (fn: (notifications: Notifications.Notification) => void) => Notifications.addNotificationReceivedListener(fn);

  unsubscribleNotification = (sub: Subscription) => Notifications.removeNotificationSubscription(sub);

  storeLocalData = async (key: string, value: any) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(key, jsonValue)
    } catch (e) {
      // saving error
    }
  }

  readLocalData = async (key: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key)
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch(e) {
      // error reading value
    }
  }
  
  clearLocalData = async () => AsyncStorage.clear();
}

const Helper = CHelper.Instance;
export default Helper;
