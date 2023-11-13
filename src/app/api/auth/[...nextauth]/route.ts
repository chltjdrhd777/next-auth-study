import axios from 'axios';
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import KakaoProvider from 'next-auth/providers/kakao';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'custom-signin', // id를 기반으로 호출 분기. (signIn 함수에서 첫째 인자로 들어가는 부분)
      credentials: {
        email: { label: '이메일', type: 'email' },
        password: { label: '패스워드', type: 'password' },
      },
      async authorize(credentials) {
        const payload = {
          email: credentials?.email,
          password: credentials?.password,
        };
        try {
          const res = await axios.post('http://localhost:3000/api/login', payload);
          console.log('user', res.data);
          return res.data;
        } catch (err) {
          console.log('err', err);
          throw new Error('인증 실패');
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET, //next-auth token의 암호화, 복호화에 사용되는 값 / 여기에 정의 안하고 .env에 NEXTAUTH_SECRET 값이 존재한다면 해당 값 사용한다.
  callbacks: {
    async jwt(props) {
      // 사용될 token에 대해서 커스터마이징 값을 넣어줄 수 있다.
      console.log('props from jwt callback', props);
      props.token.testValue = 'testValue';
      props.token.testKey = 'testkey';
      return props.token;
    },
    async session({ session }) {
      // 클라이언트에서 사용될 세션객체에 커스터마이징 값을 넣어줄 수 있다.(user 부분에)
      const copied = { ...session } as any;
      copied.testSessionValue = 'hello world';
      return copied;
    },
  },
});

export { handler as GET, handler as POST };
