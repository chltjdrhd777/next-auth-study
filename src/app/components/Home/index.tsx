'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import styled from 'styled-components';

function Page() {
  const router = useRouter();

  const navigationBtn = (route: string) => {
    router.push(route);
  };

  return (
    <HomeMain>
      <Section>
        <Button onClick={() => navigationBtn('/login')}>로그인하러 가기</Button>
        <Button onClick={() => navigationBtn('/result')}>(client)결과페이지 이동</Button>
      </Section>
    </HomeMain>
  );
}

export default Page;

const HomeMain = styled.main`
  min-width: 100vw;
  min-height: 100vh;
  background-color: aliceblue;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;
`;

const Section = styled.section`
  max-width: 300px;
  max-height: 300px;
  min-width: 500px;
  min-height: 500px;
  border: 1px solid gray;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px;
  border: 1px solid gray;
`;
