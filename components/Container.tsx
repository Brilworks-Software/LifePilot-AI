import { StyleSheet, View } from 'react-native';
import { observer } from 'mobx-react-lite';
import {  useSafeAreaInsets } from 'react-native-safe-area-context';


export const Container = observer(({ children }: { children: React.ReactNode }) => {
  const {top} = useSafeAreaInsets()
  return <View style={[styles.container, { paddingTop: top }]}>{children}</View>;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    backgroundColor: 'white',
  },
});
