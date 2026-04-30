

*A lightweight and powerful WYSIWYG editor built with vanilla JavaScript*



---

## 소개

본 Wysiwyg Editor는 SunEditor 기반으로 **순수 바닐라 JavaScript(ES2022+)**로 작성된 WYSIWYG 에디터입니다.  
이 저장소는 **소스(`src/`) + 타입 정의(`types/`) 생성 + 번들(`dist/`) 빌드**까지 포함한 개발 레포입니다.

- **참고 사이트**: `https://suneditor.com`
- **아키텍처 문서**: `GUIDE.md`, `ARCHITECTURE.md`

## 프로젝트 폴더 구조

아래는 이 레포에서 자주 만지는 경로만 추려 정리한 구조입니다.

```text
suneditor/
├─ src/                       # 제품 소스(수정 대상)
│  ├─ core/                   # 코어 런타임(커널/선택/포맷/이벤트 등)
│  │  ├─ kernel/              # Store, DI, Kernel
│  │  ├─ config/              # context/options provider, event manager 등
│  │  ├─ logic/               # dom/shell/panel 로직
│  │  └─ event/               # 내부 이벤트 오케스트레이션(handlers/reducers/effects)
│  ├─ plugins/                # 플러그인(align, font, table 등)
│  ├─ modules/                # 공용 모듈(Modal/Controller/Figure/ColorPicker 등)
│  ├─ helper/                 # 순수 유틸(dom/env/converter 등)
│  ├─ assets/                 # 기본 CSS/아이콘
│  ├─ themes/                 # 테마 CSS
│  └─ langs/                  # i18n(원본은 en.js)
├─ types/                     # 자동 생성 타입 정의(ts-build 산출물)
├─ dist/                      # 번들 산출물(build 산출물)
├─ webpack/                   # webpack 설정
├─ scripts/                   # 체크/주입/타입생성 스크립트
├─ test/                      # jest/playwright 테스트 + dev 페이지
│  └─ dev/                    # 로컬 확인용 HTML 페이지
├─ changes.md                 # 변경사항(사용자 영향 기준)
└─ GUIDE.md                   # 레포 개발 가이드(규칙/워크플로우)
```

## 이 프로젝트의 커스텀 변경점(추가/패치 JS)

이 레포에는 기본 SunEditor 코드 외에, 아래와 같은 **커스텀 패치/추가 로직**이 포함되어 있습니다. (상세 변경 이력은 `changes.md` 참고)

- **Shadow DOM 지원(선택/포커스 안정화)**
  - `src/core/schema/options.js`: `options.shadowRoot` 옵션 타입(JSDoc) 추가
  - `src/core/config/contextProvider.js`: ShadowRoot 감지/주입 로직 보강
  - `src/core/logic/dom/selection.js`: ShadowRoot 환경에서 selection/range 취득/복구 흐름 보강 (`ShadowRoot.getSelection()` 호환 처리 포함)
  - `src/core/kernel/store.js`: 툴바 상호작용 중 선택 보존을 위한 store state 키 추가(예: `_toolbarPreserveSelection`)
- **표 다중 셀 서식(커스텀 공용 로직)**
  - `src/core/logic/dom/tableMultiCellFormat.js` (추가): 표 다중 셀 선택 상태에서 굵게/정렬/색상/폰트/폰트사이즈 등을 “선택된 셀 전체”에 적용하기 위한 공용 헬퍼
  - `src/core/logic/shell/_commandExecutor.js`: 기본 폰트 스타일 명령 실행 시 위 공용 헬퍼를 우선 적용하도록 연결
  - 관련 플러그인에서 공용 헬퍼를 호출:
    - `src/plugins/dropdown/align.js`
    - `src/plugins/dropdown/font.js`
    - `src/plugins/dropdown/fontColor.js`
    - `src/plugins/dropdown/backgroundColor.js`
    - `src/plugins/input/fontSize.js`
  - 참고: 기존 플러그인 내부 서비스(`src/plugins/dropdown/table/services/`*)는 유지되며, 플러그인 간 직접 import 규칙(아키텍처 검사)을 피하기 위해 “코어 공용 로직”으로 분리했습니다.
- **개발용 페이지(로컬 확인)**
  - `test/dev/shadow_test.html`: Shadow DOM에서 SunEditor를 띄우는 최소 데모 페이지

## 브라우저 지원

폴리필 없이 **모던 브라우저** 기준으로 동작합니다. 정확한 타겟은 `package.json`의 `browserslist`를 참고하세요.

---

## 🌍 Browser Support

SunEditor is built to take advantage of modern browser capabilities.  
It does not ship with polyfills by default, but you can add them if your project requires broader compatibility.

> Works correctly on the following versions or newer.


| Browser             | ≥ Version       |
| ------------------- | --------------- |
| Chrome              | 119 (Oct 2023)  |
| Edge                | 119 (Nov 2023)  |
| Firefox             | 121 (Dec 2023)  |
| Safari (macOS, iOS) | 17.2 (Dec 2023) |
| Opera               | 105 (Nov 2023)  |
| Android WebView     | 119 (Oct 2023)  |
| Samsung Internet    | 23.0 (Oct 2023) |
| Firefox ESR         | 128 (Jul 2024)  |


❌ Not Supported : IE, Legacy Edge

### 📌 Why This Baseline? (Late 2023)

- This is based on features commonly supported by modern browsers.
- Most modern web APIs and CSS features are supported reliably in versions after this point.
- Unless specific compatibility issues arise, you can use it out of the box without additional polyfills.
- If you need support for older browsers, you can extend it by adding your own polyfills.

---

## 📦 Legacy Version (v2-legacy)

 Supported IE11

> **SunEditor v3 is the latest version.**  
> This section refers to the **previous stable version, SunEditor v2**.

The `v2-legacy` branch is no longer actively maintained,  
but still available for compatibility with older projects.

👉 `[v2-legacy` branch](https://github.com/JiHong88/SunEditor/tree/v2-legacy)

---

## 설치 & 빠른 시작

### NPM

```bash
npm install suneditor --save
```

```js
import 'suneditor/css/editor';
import 'suneditor/css/contents';
import suneditor from 'suneditor';

suneditor.create(document.querySelector('#editor'), {
	// options
});
```

### CDN (jsDelivr)

```html
<script src="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/suneditor.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/suneditor.min.css" rel="stylesheet" />
<div id="editor"></div>
<script>
	SUNEDITOR.create(document.querySelector('#editor'), {});
</script>
```

---

## 프레임워크 연동

- React: `suneditor-react`
- Vue: `suneditor-vue`

---

## 개발(로컬)

### 요구사항

- Node.js: `>=14` (권장: `v22`)

### 주요 명령어

```bash
# 개발 서버 (http://localhost:8088)
npm run dev

# 번들 빌드
npm run build:dev
npm run build:prod

# 린트(ESLint + TS typecheck + 아키텍처 의존성 규칙)
npm run lint

# 타입 정의(types/) 생성
npm run ts-build

# 테스트(Jest / Playwright)
npm test
npm run test:e2e
```

### 산출물/자동 생성 규칙(중요)

- `dist/`는 **빌드 산출물**입니다. 직접 수정하지 마세요. (`npm run build:`*로 생성)
- `types/`는 **자동 생성 타입 정의**입니다. 직접 수정하지 마세요. (`npm run ts-build`로 생성)
- 다국어는 `**src/langs/en.js`만 수정**하세요. 다른 언어 파일은 동기화 스크립트가 생성합니다.
- 아래 3개 파일은 export가 **동기화 규칙**이 있습니다(가이드 참고).
  - `src/suneditor.js`
  - `webpack/cdn-builder.js`
  - `scripts/ts-build/format-index.cjs`

### 변경사항 기록

코드 변경 후에는 루트의 `changes.md`에 사용자 영향이 있는 변경을 **최신 날짜 기준으로 상단에 추가**합니다. (형식은 `GUIDE.md` 참고)

## 개발용 페이지

- Shadow DOM 데모: `test/dev/shadow_test.html`

---

