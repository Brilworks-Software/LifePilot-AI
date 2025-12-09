import { Text, StyleSheet, View } from 'react-native'
import React, { Component } from 'react'
import MarkDowm from 'react-markdown'

interface WebMarkDownComponentProps {
  text: string
}

export default class WebMarkDownComponent extends Component<WebMarkDownComponentProps> {
  render() {
    return (
      <View>
        <MarkDowm>{this.props.text}</MarkDowm>
      </View>
    )
  }
}

const styles = StyleSheet.create({})