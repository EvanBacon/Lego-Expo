import React from 'react';
import { Picker } from 'react-native';

export default function ModelPicker({ values, onSelect, style, ...props }) {
  const [selected, setSelected] = React.useState(values[0]);
  return (
    <Picker
      {...props}
      selectedValue={selected}
      style={[{}, style]}
      onValueChange={(itemValue, itemIndex) => {
        setSelected(itemValue);
        onSelect(itemValue);
      }}
    >
      {values.map((item, index) => (
        <Picker.Item label={item} value={item} key={index} />
      ))}
    </Picker>
  );
}
