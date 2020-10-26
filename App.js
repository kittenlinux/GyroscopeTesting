import React, { Component } from 'react';
import {
  Alert,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {
  gyroscope,
  setUpdateIntervalForType,
  SensorTypes
} from "react-native-sensors";
import DialogProgress from 'react-native-dialog-progress'
let calibrate;

export default class App extends Component {
  constructor() {
    super();

    setUpdateIntervalForType(SensorTypes.gyroscope, 2000); // defaults to 100ms

    this.state = {
      updatesEnabled: false,
      x: 0,
      y: 0,
      z: 0,
      x_low: 0,
      y_low: 0,
      z_low: 0,
      x_high: 0,
      y_high: 0,
      z_high: 0
    };
  }

  calibrateGyroscope = async () => {
    const promise = new Promise((resolve, reject) => {
      const options = {
        title: "กำลังเก็บค่าไจโรสโคป",
        message: "โปรดรอสักครู่...",
        isCancelable: false
      }
      DialogProgress.show(options)
      this.setState({ updatesEnabled: true })
      let test = 0;
      calibrate = gyroscope.subscribe(({ x, y, z, timestamp }) => {
        if (test === 0) {
          this.setState({
            x_low: x,
            y_low: y,
            z_low: z,
            x_high: x,
            y_high: y,
            z_high: z,
          })
          this.setState({
            x: x,
            y: y,
            z: z
          })
          test++;
        } else {
          if (x <= this.state.x_low)
            this.setState({ x_low: x })
          else if (x >= this.state.x_high)
            this.setState({ x_high: x })
          if (y <= this.state.y_low)
            this.setState({ y_low: y })
          else if (y >= this.state.y_high)
            this.setState({ y_high: y })
          if (z <= this.state.z_low)
            this.setState({ z_low: z })
          else if (z >= this.state.z_high)
            this.setState({ z_high: z })
          this.setState({
            x: x,
            y: y,
            z: z
          })
          test++;
          if (test === 30) {
            this.stopCalibrate();
            DialogProgress.hide()
            this.setState({ updatesEnabled: false })
            resolve(test);
          }
        }
      }
      );
    });
    const result = await promise;
  }

  stopCalibrate = () => {
    calibrate.unsubscribe()
  }

  render() {
    const {
      updatesEnabled
    } = this.state;
    return (
      <View style={styles.MainContainer}>
        <StatusBar barStyle="dark-content" />
        <Text style={{ fontSize: 32, textAlign: 'center' }}>โปรแกรมเก็บค่าการ{"\n"}ทดสอบไจโรสโคป</Text>
        <Text style={{ fontSize: 24 }}>X: {this.state.x}{"\n"}Y: {this.state.y}{"\n"}Z: {this.state.z}</Text>
        <Text style={{ fontSize: 24 }}>X low: {this.state.x_low}{"\n"}Y low: {this.state.y_low}{"\n"}Z low: {this.state.z_low}</Text>
        <Text style={{ fontSize: 24 }}>X high: {this.state.x_high}{"\n"}Y high: {this.state.y_high}{"\n"}Z high: {this.state.z_high}</Text>
        {!updatesEnabled ?
          <TouchableOpacity
            onPress={async () => {
              Alert.alert(
                'ยืนยัน',
                'กดปุ่มยืนยันเพื่อเริ่มการเก็บค่า',
                [
                  { text: 'ยกเลิก', style: 'cancel' },
                  {
                    text: 'ยืนยัน', onPress: async () => {
                      const calib = await this.calibrateGyroscope()
                    }
                  },
                ],
                { cancelable: true })
            }
            } disabled={updatesEnabled}
            style={styles.button}>
            <Text style={{ color: '#FFF', fontSize: 24 }}>
              เริ่มการทำงาน
            </Text>
          </TouchableOpacity> :
          <TouchableOpacity
            onPress={() => this.removeLocationUpdates()} disabled={!updatesEnabled}
            style={styles.button_red}>
            <Text style={{ color: '#FFF', fontSize: 24 }}>
              หยุดการทำงาน
          </Text>
          </TouchableOpacity>}
      </View>
    );
  }
};

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    paddingTop: (Platform.OS) === 'ios' ? 20 : 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  QR_text: {
    color: '#000',
    fontSize: 19,
    padding: 8,
    marginTop: 12
  },
  button: {
    backgroundColor: '#2979FF',
    alignItems: 'center',
    padding: 12,
    width: 300,
    marginTop: 14
  },
  button_red: {
    backgroundColor: 'red',
    alignItems: 'center',
    padding: 12,
    width: 300,
    marginTop: 14
  },
});
