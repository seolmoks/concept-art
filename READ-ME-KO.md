# 휴대폰에서 Cloudflare로 배포하기

이 파일은 기존 갤러리의 배포용 코드입니다. 아직 사용자의 Cloudflare 계정에 설치된 것은 아닙니다.
현재 www Worker의 Hello World를 실제 갤러리로 교체합니다. 개인 계정명은 코드에 넣지 않았습니다.
작품, 업로드 이미지, 변경한 사이트 설정은 포함되지 않습니다. 기존 사이트에 데이터가 있다면 별도로 내보내고 이전해야 하며 기존 사이트를 삭제하지 마세요.

## 1. 브라우저 작업 공간 열기
https://github.com/codespaces 에 로그인합니다. 휴대폰 브라우저에서 데스크톱 사이트 보기를 켭니다.
Explore quick start templates → See all → Blank → Use this template을 선택합니다.
이 메뉴 이름이 다르게 보이면 현재 화면을 확인한 뒤 진행합니다.
개인 계정의 포함 사용량 범위에서 작업하고 유료 사용을 활성화하지 않습니다. 작업 후 Codespace를 중지합니다.

## 2. ZIP 업로드
다운로드한 concept-art-cloudflare.zip을 Codespaces의 파일 탐색기 Upload 기능으로 올립니다.
휴대폰에서 메뉴가 안 보이면 파일 탐색기의 빈 공간을 길게 눌러 Upload를 확인합니다.
터미널에서 다음을 차례로 실행합니다.

```bash
unzip concept-art-cloudflare.zip
cd concept-art
npm install
```

## 3. Cloudflare 저장소 준비
Cloudflare 계정에서 빈 D1 데이터베이스 concept-art-db를 만듭니다. 데이터베이스 UUID를 기록합니다.
R2를 활성화하고 concept-art-images 버킷을 만듭니다. 버킷은 공개하지 않습니다.
R2의 결제 조건과 무료 사용량을 먼저 확인합니다. 이 설치 프로그램은 유료 구독을 활성화하지 않습니다.
Account ID도 계정 세부 정보에서 확인합니다.

## 4. 배포 인증 준비
Cloudflare 프로필의 API Tokens에서 짧은 유효기간의 Custom token을 만듭니다.
계정 범위는 이 사이트를 배포할 계정 하나만 선택합니다.
계정 권한: Workers Scripts Edit, D1 Edit, Workers R2 Storage Edit, Account Settings Read.
권한 명칭이 화면에서 다르면 임의로 All permissions를 선택하지 말고 현재 화면을 확인합니다.
토큰과 비밀번호는 채팅이나 공개 저장소에 붙여 넣지 않습니다. 다음 단계의 숨김 입력창에만 입력합니다.

## 5. 실행
```bash
npm run setup
```
계정 ID, D1 UUID, 배포 토큰, 사이트 관리자 아이디와 비밀번호를 입력합니다.
기존 관리자 계정과 동일하게 사용하려면 같은 값을 직접 입력합니다.
토큰과 비밀번호는 터미널에 표시되지 않습니다. 서버에는 비밀번호 해시만 저장합니다.
프로그램은 데이터베이스 구조 → 관리자 비밀 설정 → 사이트 배포 순으로 진행합니다.
처음 생성한 www Worker가 이미 있어야 합니다. 설치를 반복하면 관리자 세션이 초기화됩니다.
DB나 R2 이름을 다르게 만들었다면 wrangler.json에서 이름을 맞추고 실행합니다.
기존 비어 있지 않은 DB를 지정하지 않습니다. 이 패키지는 신규 빈 DB 설치용입니다.

## 6. 확인
배포 도구가 반환한 주소를 엽니다. /login에서 로그인한 뒤 테스트 작품을 비공개로 등록해봅니다.
비로그인 상태에서 비공개 작품과 관리자 기능에 접근할 수 없는지 확인합니다.
공개로 바꾸고 이미지, 검색, 필터를 확인합니다.
AI는 외부 서비스 키를 별도로 설정하기 전까지 동작하지 않습니다. 무료 주소가 AI 비용까지 포함하지는 않습니다.
작업 후 배포 토큰을 폐기하고 Codespaces를 중지합니다. 이 ZIP은 따로 보관합니다.

## 포함 파일
- dist/: 이미 빌드한 갤러리 및 서버
- migrations/: 신규 DB 구조
- setup.mjs: 설치 절차. 토큰과 비밀번호를 파일에 저장하지 않음
- wrangler.json: Cloudflare 배포 설정
- source-backup.zip: 수정 가능한 원본 코드. 현재 Sites 연결 정보와 환경 파일은 제외
- SOURCE_VERSION.txt: 이 패키지의 원본 코드 버전

원본 코드 변경 시 다시 빌드해야 합니다. source-backup.zip은 보관용이며, 압축을 풀어 기존 dist를 덮어쓰지 마세요.
