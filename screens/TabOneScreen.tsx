import * as React from 'react'
import { useState } from 'react'
import { FlatList, View } from 'react-native'
import { Button, Icon, Text } from 'react-native-elements';
import Helper from '../helpers'
import * as Notifications from "expo-notifications";
import { LinearGradient } from 'expo-linear-gradient';
import _ from 'lodash';

interface IData {
  name: string;
  title: string | null;
  body: string | null;
  token: string;
}

const TabOneScreen: React.FC = () => {
  /**
   * Handler
   */

  const [data, _setData] = useState([] as IData[]);
  const dataRef = React.useRef(data);
  const setData = (data: any) => {
    dataRef.current = data;
    _setData(data);
  };

  Helper.clearLocalData();

  Helper.initNotification();
  Helper.requestPermission();
  // Helper.getToken();
  
  const handleNotification = async (notification: Notifications.Notification) => {
    const token = notification.request.content.data?.token as string;
    const reverseData = [...dataRef.current].reverse();
    const tokenList = _.uniq(Helper.selectFields(reverseData, 'token'));
    const foundIndex = _.indexOf(tokenList, token);
    const name = foundIndex !== -1 ? `GẤU ${foundIndex + 1}` : `GẤU ${tokenList.length + 1}`;
    
    const item: IData = {
      name,
      title: notification.request.content.title,
      body: notification.request.content.body,
      token,
    };
    let newNotifications = [item,...dataRef.current]
    setData(newNotifications);
    Helper.storeLocalData('notifications', newNotifications);
  };

  const handleLocalData = async () => { 
    const localData = await Helper.readLocalData('notifications');
    if (localData) setData(localData);
  };

  const deleteNotification = (index: number) => {
    data.splice(index, 1);
    const newData = [...data];
    setData(newData);
    Helper.storeLocalData('notifications', data);
  }

  React.useEffect(() => {
    handleLocalData(); // Handle Data from LocalStorage
    const sub = Helper.subscribeNotification(handleNotification); // Notification Subscription
    return () => Helper.unsubscribleNotification(sub);  // Notification Unsubscription
  }, []);
  
  /**
   * UI
   */
  const renderItem = ({item, index}: {item: IData, index: number}) => {
    let colors = [];
    switch(item.title){
      case '🍱 Em đói quá':
        colors = ["#d14763", "#ac7278"];
        break;
      case '🍹 Thèm trà sữa':
        colors = ["#00F260", "#0575E6"];
        break;
      case '😢 Nhớ anh quá':
        colors = ["#d0cd25", "#d3037c"];
        break;
      case '📱 Gọi e nha':
        colors = ["#c50790", "#6d6bff"];
        break;
      default:
        colors = ['#3F51B5', '#197CCB'];
    }
    
    return (
      <LinearGradient colors={colors} style={{borderRadius: 20, height: 80, marginVertical: 5, justifyContent: 'center'}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <View>
            <Text style={{ fontSize: 18, marginLeft: 15, color: 'white' }}>{item.title}</Text>
            <Text style={{ fontSize: 14, marginLeft: 15, marginVertical: 3, color: 'white' }}>{`✌️ ${item.body}`}</Text>
            <Text style={{ fontSize: 11, marginLeft: 15, color: '#CECED2' }}>{`- ${item.name} -`}</Text>
          </View>
          <Button icon={{name: 'check'}} type='clear' onPress={() => deleteNotification(index)}/>
        </View>
      </LinearGradient>
    );
  }
  
  return (
    <FlatList 
      data={data}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{paddingHorizontal:18}}
    />
  )
}

export default TabOneScreen
