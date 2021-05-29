import { LinearGradient } from 'expo-linear-gradient';
import _ from 'lodash';
import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Button,
  TouchableOpacity,
} from 'react-native';

import WheelOfFortune from './WheelOfFortune';

interface Props {
  participants: Array<string>;
  handleResult: (item: any, index: number) => any;
}

class Wheel extends Component<Props, any> {
  constructor(props: Props) {
    super(props);
    const { participants } = this.props;
    const participantsProp = [...participants]
    this.state = {
      winnerValue: null,
      winnerIndex: null,
      started: false,
      participants: participantsProp,
    };
    this.child = null;
  }
  
  static getDerivedStateFromProps(props: Props, state: any) {
    if (!_.includes(props.participants, state.winnerValue) && !state.started) {
      const diff = _.difference(props.participants, state.participants);
      const newParticipants = [...state.participants, ...diff];
      const newState = {...state, participants: newParticipants};
      return newState;
    }
    return null; // No change to state
  }

  buttonPress = () => {
    this.setState({
      started: true,
    });
    this.child._onPress();
  };

  removeWinner = (index: number) => {
    const { participants } = this.state;
    participants.splice(index, 1);
    const newParticipants = [...participants];
    this.setState({ participants: newParticipants })
  }

  render() {
    const { handleResult, participants: participantsProp } = this.props
    const { participants } = this.state;
    
    const wheelOptions = {
      rewards: participants,
      knobSize: 30,
      borderWidth: 5,
      borderColor: '#fff',
      innerRadius: 30,
      duration: 6000,
      backgroundColor: 'transparent',
      textAngle: 'horizontal',
      knobSource: require('../assets/images/knob.png'),
      onRef: ref => (this.child = ref),
    };

    if (_.isEmpty(participants)) return null;
    return (
      <View style={styles.container}>
        <StatusBar barStyle={'light-content'} />
        <WheelOfFortune
          ref={(ref) => {this.child = ref}}
          key={JSON.stringify(wheelOptions.rewards)}
          options={wheelOptions}
          getWinner={(value, index) => {
            this.setState({winnerValue: value, winnerIndex: index},() => {
              this.removeWinner(index);
              const winnerIndex = _.indexOf(participantsProp, value);
              handleResult(value, winnerIndex);
            });
          }}
        />
        {!this.state.started && (
          <View style={styles.startButtonView}>
            <TouchableOpacity
              onPress={() => this.buttonPress()}
              style={styles.startButton}>
              <Text style={styles.startButtonText}>Bắt đầu quay!</Text>
            </TouchableOpacity>
          </View>
        )}
        {this.state.winnerIndex != null && (
          <View style={styles.winnerView}>
            <Text style={styles.winnerText}>
              {`Chúc mừng ${participantsProp[this.state.winnerIndex]} đã thắng giải`}
            </Text>
            <TouchableOpacity
              onPress={() => {
                this.setState({winnerIndex: null});
                this.child._tryAgain();
              }}
              style={styles.tryAgainButton}>
              <Text style={styles.tryAgainText}>TIẾP TỤC</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
}
export default Wheel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  startButtonView: {
    position: 'absolute',
  },
  startButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    marginTop: 50,
    padding: 10,
    borderRadius: 20
  },
  startButtonText: {
    fontSize: 50,
    color: '#fff',
    fontWeight: 'bold',
  },
  winnerView: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 20,
  },
  winnerText: {
    fontSize: 22,
    color: 'white',
  },
  tryAgainButton: {
    padding: 10,
  },
  tryAgainText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00F260',
  },
});
