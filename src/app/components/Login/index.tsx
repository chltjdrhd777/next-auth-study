'use client';

import { signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { FormEvent, useState } from 'react';
import styled from 'styled-components';

function Page() {
  const router = useRouter();
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await signIn('custom-signin', {
      email: value1,
      password: value2,
      redirect: false,
    });

    if (!result?.ok) {
      return alert('인증이 실패하였습니다.');
    }

    router.push('/result');
  };
  return (
    <TestInputForm onSubmit={onSubmit}>
      <input
        type="text"
        value={value1}
        onChange={(e) => {
          setValue1(e.target.value);
        }}
      />
      <input
        type="text"
        value={value2}
        onChange={(e) => {
          setValue2(e.target.value);
        }}
      />
      <button type="submit">login</button>
      <button
        onClick={() => {
          signOut(); // 호출하면 client session 파기되고, token도 사라진다.
        }}
      >
        로그아웃
      </button>

      <Link href="/result" style={{ color: 'black' }}>
        (server)결과 페이지로 가기
      </Link>
    </TestInputForm>
  );
}

export default Page;

const TestInputForm = styled.form`
  width: 500px;
  height: 500px;
  background-color: white;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  border: 1px solid gray;
  border-radius: 10px;

  & input {
    width: 200px;
    height: 30px;
    background-color: white;
    border: 1px solid gray;
    color: black;

    &:focus {
      outline: none;
    }
  }

  & a {
    border: 1px solid gray;
    padding: 10px;
    border-radius: 10px;
  }
`;
