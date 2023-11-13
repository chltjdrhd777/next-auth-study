## Next-Auth 적용하면서 생겼던 이슈에 대한 정리

### 🤔 폴더구조 정리

App 라우팅 기준으로 하기 때문에 분산되어 있던 routes 들을 구분하여 정리하였다. 이 때에 구조는 아래와 같다.

```bash
├── (routes)
│   ├── result
│   ├── testPage
│   └── ... other page folder
│   layout.tsx
│   page.tsx
```

!! note

> 참고로, 기본 index page도 (폴더이름) 형태로 포함시켜서 관리하려고 하였으나, 이렇게 할 경우 layout에 있던 session provider들이 제대로 작동하지 않았다.

### 🤔 Next-Auth 기본구조

next13은 app 기반 폴더 구조로 라우팅한다. 그리고 page, route와 같은 특수 이름을 가진 파일명을 기반으로 작동하기 때문에 api 부분도 해당 부분처럼 만들어줘야 한다.

Next-Auth는 기본적으로 서버사이드에 api 호출폴더를 통해 만들 수 있다. 구조는 아래와 같다.

```bash
src/app

├── api
   ├── auth
       ├── [...nextauth]
            ├── route.ts
```

![next-auth folder](/public/images/next-auth.png)

> 이를 통해, 모든 api/auth로 들어오는 요청을 next-auth의 구현체를 거치게 된다.

내부의 구조는 아래와 같다.

```ts
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
      // 클라이언트에서 사용될 세션객체에 커스터마이징 값을 넣어줄 수 있다.(user 부분에. 단 타입스크립트를 쓸 경우 session 부분의 타입이 한정적이라 필요한 타입으로 assertion 해서 쓰면 좋다.)
      const copied = { ...session } as any;
      copied.testSessionValue = 'hello world';
      return copied;
    },
  },
});

export { handler as GET, handler as POST };
```

![session token](/public/images/session-token.png)
![session token](/public/images/session.png)

### 🤔 Authentication from Client

클라이언트측에서는 간단하게 Next-Auth에서 제공하는 _Signin_, _signout_ 함수를 이용하여 인증 요청이 가능하다.
예시는 아래와 같다.

```ts
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
```

### 🤔 protected route & middleware

특정 라우팅에 대해서 접근하지 못하도록 하는 것은 중요하다.<br/>
현재 클라이언트쪽에서는 session이라는 값으로, 서버쪽에서는 token이라는 값으로 이 사용자가 로그인 했는지 안했는 지 확인이 가능하다.

Next-auth에서 제공하는 middleware을 사용하면, 손쉽게 protected route의 구현이 가능하다.

> middleware의 이름은 middleware.ts(혹은 js) 여야하며, 위치는 라우팅 시작하는 _app_ 폴더와 동일한 위치에 있어야 한다.

![session token](/public/images/middleware1.png)

> 내부 내용은 아래와 같다.

```ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  const session = await getToken({ req, secret }); // 로그인 한 상태라면 존재.

  if (session === null) {
    return NextResponse.rewrite(new URL('/failRedirect', req.url));
  } else {
    return NextResponse.rewrite(new URL('/result', req.url));
  }
}

export const config = {
  matcher: ['/result', '/testPage/:path*'], // 여기에 어떤 route로 이동했을 때 이 미들웨어가 발동하도록 할 건지 정해줄 수 있다.
};
```

`note`

조금 생각해봐야 할 내용이 있는데, "NextResponse.rewrite" 부분이다. <br/> 처음에는 당연히 redirect로 했었는데, 이렇게 해놨을 경우 너무 많은 middleware 요청이 발생하여 홈페이지가 터졌다.

rewite는 현재의 요청을 인자로 들어오는 url로 바꿔서 교체하는 역할을 하는데, 이것이 한번만 요청하는 이유가 무엇인 지를 아직은 잘 모르겠다.

두번째로 이해가 안되는 부분은 next-auth의 middleware가 당연히 서버사이드만 발동할 것이라고 생각했던 부분에서 "router.push"와 같은 client side의 routing 함수 호출에도 작동한다는 점이었다.

> 처음에는 클라이언트는 HOC로 감싸줬었는데, 그럴 필요가 없어졌다는 것은 감사하지만.... 캐싱덕택인지 라우팅해도 요청을 안하는 것에도 감사하긴 하지만.... 그러지만 좀 찝찝하다.
