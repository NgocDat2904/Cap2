import React, { useRef, useEffect } from "react";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";

const transformer = new Transformer();

const mockMarkdownData = `
# Lập trình ReactJS Thực chiến
## 1. Mở đầu
- Cài đặt môi trường (NodeJS, VS Code)
- Kiến trúc Component
- JSX là gì?
## 2. Hooks Cơ bản
- \`useState\` (Quản lý trạng thái)
- \`useEffect\` (Vòng đời)
- \`useRef\` (Tham chiếu DOM)
## 3. Quản lý State Nâng cao
- Context API
- Redux Toolkit
## 4. Dự án thực tế (EduSync)
- Setup TailwindCSS
- React Router DOM
`;

const CourseMindmap = () => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current) {
      const { root } = transformer.transform(mockMarkdownData);
      svgRef.current.innerHTML = "";
      Markmap.create(svgRef.current, null, root);
    }
  }, []);

  return (
    <div className="w-full h-[400px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative">
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
      <p className="absolute bottom-2 left-0 w-full text-center text-[10px] font-semibold text-slate-400 pointer-events-none">
        * Cuộn chuột để Thu/Phóng - Kéo thả để Di chuyển sơ đồ
      </p>
    </div>
  );
};

export default CourseMindmap;
