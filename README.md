# 바둑 게임 (Go Game)

Next.js와 TypeScript로 구현한 바둑 게임입니다. AI 대전 모드와 2인 플레이 모드를 지원합니다.

## 기술 스택

- Next.js 14.1.0
- TypeScript
- Tailwind CSS
- Vercel (배포)

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx        # 메인 게임 페이지
│   ├── layout.tsx      # 루트 레이아웃
│   └── globals.css     # 전역 스타일
├── components/
│   └── Board.tsx       # 바둑판 컴포넌트
├── types/
│   └── game.ts         # 타입 정의
└── utils/
    ├── gameLogic.ts    # 게임 로직
    └── aiLogic.ts      # AI 로직
```

## 개발 과정

1. 프로젝트 초기 설정
   ```bash
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   ```

2. 타입 정의 (src/types/game.ts)
   - StoneColor: 'black' | 'white' | null
   - Position: { row: number; col: number }
   - BoardState: StoneColor[][]
   - GameState: 게임 상태 관리를 위한 타입

3. 게임 로직 구현 (src/utils/gameLogic.ts)
   - createEmptyBoard(): 19x19 빈 바둑판 생성
   - getAdjacentPositions(): 인접한 위치 확인
   - findGroup(): 돌 그룹 찾기
   - isValidMove(): 착수 가능 여부 확인
   - makeMove(): 돌 착수 및 따낸 돌 처리

4. AI 로직 구현 (src/utils/aiLogic.ts)
   - 규칙 기반 AI 구현
   - 가중치 맵을 통한 착수점 평가
   - 돌 따먹기, 방어, 연결 등 기본 전략 구현

5. 바둑판 컴포넌트 구현 (src/components/Board.tsx)
   - 19x19 격자 구현
   - 돌 놓기 기능
   - 화점(star points) 표시
   - 마지막 착수 위치 표시

6. 메인 게임 페이지 구현 (src/app/page.tsx)
   - 게임 상태 관리
   - AI 대국 기능
   - 턴 관리
   - 잡은 돌 카운트

## 주요 기능

1. 게임 모드
   - AI 대전 모드
   - 2인 플레이 모드

2. 게임 규칙
   - 표준 바둑 규칙 준수
   - 착수 가능 위치 검증
   - 돌 따먹기(캡처) 구현
   - 자살수 방지

3. UI/UX
   - 현재 플레이어 표시
   - 마지막 착수 위치 하이라이트
   - 잡은 돌 수 표시
   - AI 계산 중 표시

## 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/Kevin-innovation/baduk-game.git

# 디렉토리 이동
cd baduk-game

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 배포

- 프로덕션 버전: [https://baduk-game.vercel.app](https://baduk-game.vercel.app)
- 자동 배포: GitHub 저장소에 push하면 Vercel이 자동으로 배포합니다.

## 최근 업데이트

1. 착수 규칙 개선
   - 돌 주변(상하좌우) 착수 가능하도록 수정
   - 자살수 체크 로직 개선
   - 돌 따먹기 로직 최적화

2. AI 기능
   - AI 모드 토글 기능 추가
   - AI 계산 중 상태 표시
   - AI 응답 시간 최적화

3. UI 개선
   - DLAB Kevin 로고 추가
   - 게임 상태 표시 개선
   - 모바일 반응형 디자인 적용

## 향후 계획

1. 기능 개선
   - AI 난이도 조절 기능
   - 무르기 기능
   - 게임 저장/불러오기

2. UI/UX 개선
   - 착수 가능 위치 표시
   - 소리 효과
   - 다크 모드 지원

## 문제 해결 기록

1. 착수 규칙 문제
   - 문제: 돌 주변 착수가 불가능한 문제
   - 해결: isValidMove 함수 로직 개선 및 자유도 체크 방식 수정

2. 타입 에러
   - 문제: GameState 인터페이스의 isAIMode 속성 누락
   - 해결: 모든 상태 업데이트에 isAIMode 속성 추가

## 기여 방법

1. 이슈 등록
2. Pull Request 제출
3. 코드 리뷰 진행

## 라이선스

MIT License

## 제작자

DLAB Kevin 