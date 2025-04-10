# Baduk (Go) Game

Next.js와 TypeScript를 사용한 바둑 게임 구현 프로젝트입니다. AI와 대국할 수 있는 기능을 포함하고 있습니다.

## 기술 스택

- Next.js 14.1.0
- React 18.2.0
- TypeScript
- Tailwind CSS

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

1. 바둑 기본 규칙
   - 19x19 바둑판
   - 흑백 번갈아 가며 착수
   - 돌 따먹기 규칙
   - 자충수 방지

2. AI 기능
   - AI ON/OFF 전환 가능
   - 규칙 기반 AI 구현
   - 가중치 기반 착수점 선택
   - 0.5초 딜레이로 자연스러운 대국 진행

3. UI/UX
   - 현재 차례 표시
   - 잡은 돌 개수 표시
   - 마지막 착수 위치 하이라이트
   - 반응형 디자인

## 설치 및 실행

1. 의존성 설치
   ```bash
   npm install
   ```

2. 개발 서버 실행
   ```bash
   npm run dev
   ```

3. 브라우저에서 확인
   ```
   http://localhost:3000
   ```

## 추가 개발 예정 기능

1. 무르기 기능
2. 기보 저장 및 불러오기
3. 고급 AI 알고리즘 적용 (MCTS, Neural Network)
4. 온라인 대전 기능
5. 게임 종료 및 점수 계산

## 문제 해결 기록

1. Tailwind CSS 설정
   - grid-cols-19 클래스 추가
   - postcss.config.js 설정
   - globals.css 설정

2. 바둑판 렌더링 문제
   - flex 레이아웃으로 변경
   - 격자 및 돌 크기 조정
   - 화점 위치 조정

3. 환경 설정 문제
   - node_modules 재설치
   - .next 캐시 삭제
   - 타입스크립트 설정 확인 