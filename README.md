# Focus-Tracker



### MySQL 데이터베이스 생성

MySQL 접속 후 아래 쿼리 실행

```sql
CREATE DATABASE focus_tracker
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
```



### 백엔드 DB 비밀번호 설정

`demo/src/main/resources/application.yml` 파일에서 본인 MySQL 비밀번호로 수정

```yaml
spring:
  datasource:
    password: 여기에_본인_비밀번호_입력
```



### 백엔드 실행

IntelliJ에서 `demo` 폴더 열고 `DemoApplication.java` 실행

또는 터미널에서

```bash
cd demo
./gradlew bootRun
```

> ✅ http://localhost:8080 에서 실행



### 프론트엔드 실행

새 터미널을 열고

```bash
cd focus-tracker-front
npm install
npm run dev
```

> ✅ http://localhost:5173 에서 실행



### 브라우저에서 접속

http://localhost:5173 접속 후 회원가입 → 로그인
