import * as React from 'react'
import { useState } from 'react'
import Helper from '../helpers'
import * as Notifications from "expo-notifications";
import _ from 'lodash';
import Wheel from '../components/Wheel';
import { Dimensions, View } from 'react-native';
import { Icon, Text } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface IUser {
  name: string;
  token: string;
}

const TabTwoScreen: React.FC = () => {
  const [winners, setWinners] = useState([] as IUser[]);
  const [players, _setPlayers] = useState([] as IUser[]);
  const playersRef = React.useRef(players);
  const setPlayers = (players: any) => {
    playersRef.current = players;
    _setPlayers(players);
  };

  /**
   * Handle Notification
   */
  const handleNotification = async (notification: Notifications.Notification) => { 
    let newPlayers = [...playersRef.current, {
      name: `GẤU ${playersRef.current.length + 1}`,
      token: notification.request.content.data?.token
    }];
    newPlayers = _.uniqBy(newPlayers, 'token');
    setPlayers(newPlayers);
    Helper.storeLocalData('players', newPlayers);
  };

  const handleLocalData = async () => { 
    const newPlayers = await Helper.readLocalData('players');
    if (newPlayers) setPlayers(newPlayers);
  };

  React.useEffect(() => {
    handleLocalData(); // Handle Data from LocalStorage
    const sub = Helper.subscribeNotification(handleNotification); // Notification Subscription
    return () => Helper.unsubscribleNotification(sub);  // Notification Unsubscription
  }, []);
  
  const sendNotification = (token: string) => Helper.sendNotification(token,'🚀 Congratulations ', 'Chúc mừng bạn đã trúng thưởng 👏👏👏');

  const handleResult = (item: any, index: number) => {
    const newWinners = [...winners, players[index]]
    setWinners(newWinners);
    sendNotification(players[index].token);
  }
  
  return (
    <LinearGradient colors={["#0575E6", "#06D257"]} style={{flex: 1}}>
      {!_.isEmpty(players) ? <Wheel participants={Helper.selectFields(players, 'name')} handleResult={handleResult}/> : null}
      <View style={{position: 'absolute', padding: 15}}>
        <View style={{ width: 400}}>
        {!_.isEmpty(players) ? <Text style={{fontSize: 25, fontWeight: 'bold', marginBottom: 5}}>Danh sách thắng giải</Text> : null}
        </View>
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        {
          !_.isEmpty(winners) ? 
          winners.map((e,index) => (
            <TouchableOpacity 
              style={{flexDirection: 'row', alignItems: 'center', width: (width-30)/4, marginVertical: 5}}
              key={index.toString()}
              onPress={() => sendNotification(e.token)}
            >
              <Icon name="account-circle" containerStyle={{marginRight:5}} />
              <Text style={{fontSize: 18}}>{e.name}</Text>
            </TouchableOpacity>
          )) : null
        }
        </View>
      </View>
    </LinearGradient>
  )
}

export default TabTwoScreen
