import React, { useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import * as Yup from 'yup';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import { useTheme } from 'styled-components';
import Icon from 'react-native-vector-icons/Feather';

import getValidationErrors from '../../utils/getValidationErrors';
import api from '../../services/api';
import { useAuth } from '../../hooks/auth';

import Input from '../../components/Input';
import Button from '../../components/Button';

import {
  Container,
  BackButton,
  Title,
  UserAvatarButton,
  UserAvatar,
} from './styles';

interface ProfileFormData {
  name: string;
  email: string;
  old_password: string;
  password: string;
  password_confirmation: string;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const theme = useTheme();

  const formRef = useRef<FormHandles>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const oldPasswordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const navigation = useNavigation();

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleUpdateAvatar = useCallback(() => {
    ImagePicker.showImagePicker(
      {
        title: 'Selecione um avatar',
        cancelButtonTitle: 'Cancelar',
        takePhotoButtonTitle: 'Usar câmera',
        chooseFromLibraryButtonTitle: 'Escolher da galeria',
      },
      responseImage => {
        if (responseImage.didCancel) {
          return;
        }

        if (responseImage.error) {
          Alert.alert('Erro ao atualizar seu avatar.');
          return;
        }

        const data = new FormData();

        data.append('avatar', {
          type: 'image/jpeg',
          name: `${user.id}.jpg`,
          uri: responseImage.uri,
        });

        api.patch('/users/avatar', data).then(response => {
          updateUser(response.data);
        });
      },
    );
  }, [user.id, updateUser]);

  const handleSubmit = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome é obrigatório'),
          email: Yup.string()
            .required('E-mail é obrigatório')
            .email('Digite um e-mail válido'),
          old_password: Yup.string(),
          password: Yup.string().when('old_password', {
            is: val => !!val.length,
            then: Yup.string()
              .min(6, 'No mínimo 6 dígitos')
              .required('Campo obrigatório'),
            otherwise: Yup.string(),
          }),
          password_confirmation: Yup.string()
            .when('old_password', {
              is: val => !!val.length,
              then: Yup.string().required('Campo obrigatório'),
              otherwise: Yup.string(),
            })
            .oneOf([Yup.ref('password'), null], 'Confirmação incorreta'),
        });

        await schema.validate(data, { abortEarly: false });

        const {
          name,
          email,
          old_password,
          password,
          password_confirmation,
        } = data;

        const formData = {
          name,
          email,
          ...(old_password
            ? {
                old_password,
                password,
                password_confirmation,
              }
            : {}),
        };

        const response = await api.put('/profile', formData);

        updateUser(response.data);

        Alert.alert('Perfil atualizado com sucesso!');
        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);
          return;
        }

        Alert.alert(
          'Erro na atualização do perfil',
          'Ocorreu um error ao atualizar seu perfil, tente novamente.',
        );
      }
    },
    [navigation, updateUser],
  );

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <Container>
            <BackButton onPress={handleGoBack}>
              <Icon name="chevron-left" size={24} color={theme.colors.gray} />
            </BackButton>

            <UserAvatarButton onPress={handleUpdateAvatar}>
              <UserAvatar
                source={{
                  uri:
                    user.avatar_url ||
                    'https://api.adorable.io/avatars/186/abott@adorable.png',
                }}
              />
            </UserAvatarButton>

            <View>
              <Title>Meu Perfil</Title>
            </View>

            <Form
              initialData={{ name: user.name, email: user.email }}
              ref={formRef}
              onSubmit={handleSubmit}
            >
              <Input
                autoCapitalize="words"
                name="name"
                icon="user"
                placeholder="Nome"
                returnKeyType="next"
                onSubmitEditing={() => {
                  emailInputRef.current?.focus();
                }}
              />

              <Input
                ref={emailInputRef}
                keyboardType="email-address"
                autoCorrect={false}
                autoCapitalize="none"
                name="email"
                icon="mail"
                placeholder="E-mail"
                returnKeyType="next"
                onSubmitEditing={() => oldPasswordInputRef.current?.focus()}
              />

              <Input
                ref={oldPasswordInputRef}
                secureTextEntry
                name="old_password"
                icon="lock"
                placeholder="Senha atual"
                textContentType="newPassword"
                returnKeyType="next"
                containerStyle={{ marginTop: 16 }}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
              <Input
                ref={passwordInputRef}
                secureTextEntry
                name="password"
                icon="lock"
                placeholder="Nova senha"
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              />
              <Input
                ref={confirmPasswordInputRef}
                secureTextEntry
                name="password_confirmation"
                icon="lock"
                placeholder="Confirmar senha"
                textContentType="newPassword"
                returnKeyType="send"
                onSubmitEditing={() => formRef.current?.submitForm()}
              />

              <Button onPress={() => formRef.current?.submitForm()}>
                Confirmar mudanças
              </Button>
            </Form>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Profile;
