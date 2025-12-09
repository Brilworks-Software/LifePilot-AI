import { Text, StyleSheet, View } from 'react-native'
import React, { Component } from 'react'
import MarkDowm from 'react-native-markdown-display'

interface MobileMarkDownComponentProps {
  text: string
}

export default class MobileMarkDownComponent extends Component<MobileMarkDownComponentProps> {
  render() {
    return (
      <View>
        <MarkDowm>{this.props.text}</MarkDowm>
      </View>
    )
  }
}

const styles = StyleSheet.create({})