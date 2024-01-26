import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { object, string, TypeOf } from 'zod';
import './ModalLogin.css';
import { useModal } from '../../state/ModalContext';
import { TailSpin } from "react-loader-spinner";
import axios from 'axios';
import { useAuth } from '../../state/AuthContext';

const registerSchema = object({
    username: string().max(30, { message: 'ユーザー名は30文字以下である必要があります' }).nonempty({ message: 'ユーザー名を入力してください' }),
    userId: string().max(30, { message: 'ユーザーIDは30文字以下である必要があります' }).nonempty({ message: 'ユーザーIDを入力してください' }),
    email: string().email({ message: '無効なメールアドレスです' }).nonempty({ message: 'メールアドレスを入力してください' }),
    password: string().min(8, { message: 'パスワードは8文字以上である必要があります' }).max(30, { message: 'パスワードは30文字以下である必要があります' }).nonempty({ message: 'パスワードを入力してください' }),
})

const loginSchema = object({
    email: string().email({ message: '無効なメールアドレスです' }).nonempty({ message: 'メールアドレスを入力してください' }),
    password: string().min(8, { message: 'パスワードは8文字以上である必要があります' }).max(30, { message: 'パスワードは30文字以下である必要があります' }).nonempty({ message: 'パスワードを入力してください' }),
})

type RegisterFormInputs = TypeOf<typeof registerSchema>;

export default function ModalLogin() {
    const { setShowLogin } = useModal();
    const { setUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<RegisterFormInputs>({
        resolver: zodResolver(showRegister ? registerSchema : loginSchema),
        mode: 'onChange'
    });

    useEffect(() => {
        reset();
    }, [showRegister, reset]);

    const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
        try {
            setIsLoading(true);
            const response = await (showRegister
                ? axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
                    username: data.username,
                    userId: data.userId,
                    email: data.email,
                    password: data.password
                })
                : axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
                    email: data.email,
                    password: data.password
                })
            );
            setUser(response.data)
            setShowLogin(false);
        } catch (err) {
            console.log("err:", err)
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='ModalLoginOverlay' onClick={() => setShowLogin(false)}>
            <form className='ModalLoginDialog' onSubmit={handleSubmit(onSubmit)} onClick={(e) => e.stopPropagation()}>
                <div className='ModalLoginContent'>
                    <h2>{showRegister ? "アカウントを作成" : "アカウントにログイン"}</h2>
                    {showRegister &&
                        <>
                            <input type='text' placeholder='ユーザー名' {...register('username')} />
                            <p className='errorMessage'>{errors.username?.message}</p>
                            <input type='text' placeholder='ユーザーID' {...register('userId')} />
                            <p className='errorMessage'>{errors.userId?.message}</p>
                        </>}
                    <input type='email' placeholder='メールアドレス' autoComplete='email' {...register('email')} />
                    <p className='errorMessage'>{errors.email?.message}</p>
                    <input type='password' placeholder='パスワード' autoComplete="current-password" {...register('password')} />
                    <p className='errorMessage'>{errors.password?.message}</p>
                </div>
                <div className="SubmitButtonWrapper">
                    {showRegister ?
                        <button type='button' className='link' onClick={() => setShowRegister(false)}>ログインはこちら</button>
                        :
                        <button type='button' className='link' onClick={() => setShowRegister(true)}>アカウント登録はこちら</button>
                    }
                    {isLoading ?
                        <TailSpin color='#00BFFF' height={30} width={30} />
                        :
                        (
                            showRegister ?
                                <button type='submit' className='SubmitButton'>登録</button>
                                :
                                <button type='submit' className='SubmitButton'>ログイン</button>
                        )
                    }
                </div>
            </form>
        </div>
    );
}
