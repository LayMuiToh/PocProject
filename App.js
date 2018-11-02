/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  TouchableWithoutFeedback,
  TouchableOpacity
} from 'react-native';

import {YellowBox} from 'react-native';
import RNFS from "react-native-fs";
import binaryToBase64 from "binaryToBase64";
import Sound from "react-native-sound";
import toWav from "./toWav";
import Recording from 'react-native-recording';

YellowBox.ignoreWarnings(['Remote debugger']);


export default class App extends React.Component {
   data = new ArrayBuffer(0);
  _player;

  state = {
    isRecording: undefined,
    containRecords: false,
    isPlayback: false,
  }

  _appendBuffer = (buffer1, buffer2) => {
    let buff1Int16Arr = new Int16Array(buffer1);
    var tmp = new Int16Array(buff1Int16Arr.length + buffer2.length);
    tmp.set(buff1Int16Arr, 0);
    tmp.set(buffer2, buff1Int16Arr.length);
    return tmp.buffer;
  };


  replayAudio = async () => {
    console.log('replay Audio')
    const path = RNFS.DocumentDirectoryPath + '/feedback.wav';
    const isExists = await RNFS.exists(path);

    this.setState({isPlayback: true});

    if (isExists) {
      await RNFS.unlink(path);
    }

    await this.writeFileAndPlay(path);


  }

  writeFileAndPlay = async (path) => {
    const wav = toWav(new Int16Array(this.data));
    const base64Str = binaryToBase64(wav.buffer);


    // write the file
    await RNFS.writeFile(path, base64Str, 'base64');


    Sound.setCategory('Playback');


    this._player = new Sound('feedback.wav', Sound.DOCUMENT, (error) => {


      if (error) {
        console.error({
          message: `failed to load the sound - ${JSON.stringify(error)}`
        });
        return;
      }

      this._player.setVolume(1.0);

      this._player.play((success) => {

        if (success) {
          console.log('successfully finished playing');
          this.setState({isPlayback: false});
        } else {
          console.log('playback failed due to audio decoding errors');
          // reset the player to its uninitialized state (android only)
          // this is the only option to recover after an error occured and use the player again
          if (this._player && this._player.reset) {
            this._player.reset();
          }
        }

        if (this._player && this._player.release) {
          this._player.release();
        }
        Sound.setCategory('Record');
      });
    });

  }


  onPressIn = () => {

    Recording.init({
      bufferSize: 4096,
      sampleRate: 15000,
      bitsPerChannel: 16,
      channelsPerFrame: 1,
    })

    Recording.start();

    this.data = new ArrayBuffer(0);

    console.log('Press In');

    this.setState({isRecording: true});
  }


  onPressOut = () => {
    this.setState({isRecording: false});

    this.setState({containRecords: this.data !== null});

    Recording.stop();
    console.log("data:", this.data !== null);
    console.log('Press Out');
  }

  onPressPop = () => {
    Alert.alert('Pop Up Window')

  }

  componentDidMount() {
    Recording.addRecordingEventListener(data => {

      const buff = new Int16Array(data);
      const audioData = this._appendBuffer(this.data, buff);
      this.data = audioData

      console.log(data);
    })
  }


  render() {


    return (
      <View style={styles.container}>
        <View style={{
          position: 'absolute',
          marginTop: 50,
          width: '100%',
          height: 40,
          justifyContent: 'center'
        }}>
          <Text style={{
            textAlign: 'center',
            fontSize: 30,
            color: this.state.isRecording ? 'black' : '#F5FCFF'
          }}>Recording...</Text>

          {
            this.state.containRecords && this.state.isRecording === false &&
            <View>
              <Text style={{
                textAlign: 'center',
                fontSize: 30,
                color: 'black',
                paddingBottom: 50
                
              }}>Data successfully recorded!</Text>
              
            </View>
           
          }
          </View>

       
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignSelf: 'center'
        }}>
           
       
          <TouchableWithoutFeedback
            onPressIn={this.onPressIn}
            onPressOut={this.onPressOut}
          >
            <View style={{
              backgroundColor: this.state.isRecording ? 'gray' : 'green',
              padding: 10,
              width: 200,
            }}>
              <Text accessibilityLabel="Hold" style={{
                color: 'white',
                textAlign: 'center'
              }}>Hold to Talk</Text>
            </View>

          </TouchableWithoutFeedback>

          {
            !this.state.isPlayback &&
            <TouchableOpacity
              onPress={this.replayAudio.bind(this)}
              style={{
                marginTop: 40,
                width: 200,
                backgroundColor: this.state.isRecording !== false ? '#F5FCFF' : 'blue',
                alignSelf: 'center',
                padding: 10
              }}>
              <Text style={{
                color: 'white',
                textAlign: 'center'
              }}> {this.state.containRecords && this.state.isRecording === false ? 'Play Recording' : ''}</Text>
            </TouchableOpacity>
          }

          {
            this.state.isPlayback &&
            <View
              style={{
                marginTop: 40,
                width: 200,
                backgroundColor: this.state.isRecording !== false ? '#F5FCFF' : 'blue',
                alignSelf: 'center',
                padding: 10
              }}>
              <Text style={{
                color: 'white',
                textAlign: 'center'
              }}> {this.state.containRecords && this.state.isRecording === false ? 'Play Recording' : ''}</Text>
            </View>
          }

 
        </View>
       

      </View>
      
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
