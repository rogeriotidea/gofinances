import React from 'react';
import { RectButton } from 'react-native-gesture-handler';
import { Container, Title } from './styles';

interface Props {
    title: string;
    onPress: () => void;
}

export function Button({title, onPress, ...rest}: Props) {
  return (
    <Container onPress={onPress} {...rest}>
        <Title>{title}</Title> 
    </Container>
  );
}

export default Button;