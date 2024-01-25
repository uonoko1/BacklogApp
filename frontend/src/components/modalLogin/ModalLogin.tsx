import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { object, string, TypeOf } from 'zod';
import './ModalLogin.css';
import { useModal } from '../../state/ModalContext';

const loginSchema = object({
    email: string()
        .nonempty({ message: 'メールアドレスを入力してください' })
        .email({ message: '無効なメールアドレスです' }),
    password: string()
        .nonempty({ message: 'パスワードを入力してください' })
        .min(8, { message: 'パスワードは8文字以上である必要があります' }),
});

type LoginFormInputs = TypeOf<typeof loginSchema>;

export default function ModalLogin() {
    const { setShowLogin, setShowRegister } = useModal();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
        resolver: zodResolver(loginSchema),
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
        console.log(data);
        // ここにログイン処理のロジックを追加
    };

    return (
        <div className='ModalLoginOverlay' onClick={() => setShowLogin(false)}>
            <form className='ModalLoginDialog' onSubmit={handleSubmit(onSubmit)} onClick={(e) => e.stopPropagation()}>
                <div className='ModalLoginContent'>
                    <h2>アカウントにログイン</h2>
                    <input type='email' placeholder='メールアドレス' {...register('email')} className='LoginEmailInput' />
                    <p className='errorMessage'>{errors.email?.message}</p>
                    <input type='password' placeholder='パスワード' {...register('password')} className='LoginPasswordInput' />
                    <p className='errorMessage'>{errors.password?.message}</p>
                </div>
                <div className="SubmitButtonWrapper">
                    <button type='button' className='link' onClick={() => setShowRegister(true)}>アカウント登録はこちら</button>
                    <button type='submit' className='SubmitButton'>ログイン</button>
                </div>
            </form>
        </div>
    );
}
