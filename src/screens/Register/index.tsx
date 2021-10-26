import React, { useState, useEffect } from 'react';
import { Alert, Keyboard, Modal, TouchableWithoutFeedback } from 'react-native';
import uuid from 'react-native-uuid';

import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';

import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InputForm } from '../../components/Forms/InputForm';
import { Button } from '../../components/Forms/Button';
import { TransactionTypeButton } from '../../components/Forms/TransactionTypeButton';
import { CategorySelectButton } from '../../components/Forms/CategorySelectButton';
import { CategorySelect } from '../../screens/CategorySelect';

import { 
    Container,
    Header,
    Title,
    Form,
    Fields,
    TransactionsTypes
 } from './styles';  
import { useAuth } from '../../hooks/auth';

interface FormData {
  name: string;
  amount: number;
}

type NavigationProps = {
  navigate:(screen:string) => void;
}

const schema = Yup.object().shape({
  name: Yup
  .string()
  .required('Nome é obrigatório'),
  amount: Yup
  .number()
  .typeError('Informe um valor numérico')
  .positive('O valor não pode ser negativo')
  .required('Preço é obrigatório')
}).required();

export function Register() {

  const {user} = useAuth();
  const dataKey = `@gofinances:transactions_user:${user.id}`;

  const [category, setCategory] = useState({
    key: 'category',
    name: 'Categoria',   
  });
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema)
  });

  const [transactionType, setTransactionType] = useState('');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const navigation = useNavigation<NavigationProps>()

  function handleTransactionsTypeSelect(type: 'positive' | 'negative') {
    setTransactionType(type);
  }

  function handleCloseSelectCategoryModal(){
    setCategoryModalOpen(false);
  }

  function handleOpenSelectCategoryModal(){
    setCategoryModalOpen(true);
  }

  async function handleRegister(form: FormData){

    if (!transactionType){ 
      return Alert.alert('Selecione o tipo de transação');
    }

    if (category.key === 'category'){
      return Alert.alert('Selecione a categoria');
    }

    const newTransaction = {
      id: String(uuid.v4()),
      name: form.name,
      amount: form.amount,
      type: transactionType,
      category: category.key,
      date: new Date()
    }

    try {
      const data = await AsyncStorage.getItem(dataKey);
      const currentData = data ? JSON.parse(data) : [];

      const dataformatted = [
        ...currentData, 
        newTransaction
      ];

      await AsyncStorage.setItem(dataKey, JSON.stringify(dataformatted));    

      reset();
      setTransactionType('');

      setCategory({
        key: 'category',
        name: 'Categoria',   
      });
      
      navigation.navigate('Listagem');

    } catch (e){

       Alert.alert('Nao foi possivel salvar');
    }
  }

  useEffect(() => {
     async function loadData(){
        const data = await AsyncStorage.getItem(dataKey);
        console.log(JSON.parse(data!));
     }
     loadData();  

     /*
     async function removeAll(){
       await AsyncStorage.removeItem(dataKey);
     }
     removeAll();
     */
  },[]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        <Header>
            <Title>Cadastro</Title>
        </Header>

        <Form>
          <Fields>

            <InputForm
              name="name"
              control={control}
              placeholder="Nome"
              autoCapitalize="characters"
              autoCorrect={false}
              error={errors.name && errors.name.message}
            />

            <InputForm
              name="amount"
              control={control}
              placeholder="Preço"
              keyboardType="numeric"
              error={errors.amount && errors.amount.message}
              
            />

            <TransactionsTypes>
              <TransactionTypeButton 
                type="up" 
                title="Income" 
                isActive={transactionType === 'positive'}
                onPress={() => handleTransactionsTypeSelect('positive')}
              />
              <TransactionTypeButton 
                type="down" 
                title="Outcome" 
                isActive={transactionType === 'negative'}
                onPress={() => handleTransactionsTypeSelect('negative')}
              />  
            </TransactionsTypes> 
 
            <CategorySelectButton 
              title={category.name} 
              onPress={handleOpenSelectCategoryModal}
            />

          </Fields>

          <Button 
            title="Enviar"  
            onPress={handleSubmit(handleRegister)}           
          />
          
        </Form>

        <Modal visible={categoryModalOpen}>
          <CategorySelect
            category={category}
            setCategory={setCategory}
            closeSelectCategory={handleCloseSelectCategoryModal}

          />
        </Modal>     
    </Container>
   </TouchableWithoutFeedback>
  );
}

export default Register;