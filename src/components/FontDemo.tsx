const FontDemo = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Custom Fonts with @font-face in Vite
        </h1>
        <p className="text-slate-600">
          Examples of locally loaded fonts using @font-face CSS rule
        </p>
      </div>

      {/* Default System Fonts */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Default System Fonts</h2>
        <div className="space-y-2">
          <p className="text-lg">This text uses the default system font stack.</p>
          <p className="text-sm text-slate-600">Font-family: system-ui, sans-serif</p>
        </div>
      </div>

      {/* Goldman Font Examples */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Goldman Font Family</h2>
        <div className="space-y-4">
          <div>
            <p className="font-goldman text-2xl text-blue-600">
              This is Goldman Regular font
            </p>
            <p className="text-sm text-slate-500">Class: font-goldman</p>
          </div>
          <div>
            <p className="font-goldman-bold text-2xl text-blue-700">
              This is Goldman Bold font
            </p>
            <p className="text-sm text-slate-500">Class: font-goldman-bold</p>
          </div>
        </div>
      </div>

      {/* Lobster Font Examples */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Lobster Font Family</h2>
        <div>
          <p className="font-lobster text-3xl text-purple-600">
            This is Lobster Cursive Font
          </p>
          <p className="text-sm text-slate-500">Class: font-lobster</p>
        </div>
      </div>

      {/* CSS Variables Usage */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Using CSS Variables</h2>
        <div className="space-y-4">
          <div style={{ fontFamily: 'var(--font-goldman)' }}>
            <p className="text-xl text-green-600">
              Using CSS variable: var(--font-goldman)
            </p>
          </div>
          <div style={{ fontFamily: 'var(--font-lobster)' }}>
            <p className="text-2xl text-green-700">
              Using CSS variable: var(--font-lobster)
            </p>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">How to Use</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-slate-800 mb-2">1. Using CSS Classes:</h3>
            <pre className="bg-slate-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`<p className="font-goldman">Goldman Regular</p>
<p className="font-goldman-bold">Goldman Bold</p>
<p className="font-lobster">Lobster Cursive</p>`}
            </pre>
          </div>
          <div>
            <h3 className="font-medium text-slate-800 mb-2">2. Using CSS Variables:</h3>
            <pre className="bg-slate-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`<p style={{ fontFamily: 'var(--font-goldman)' }}>Text</p>
<p style={{ fontFamily: 'var(--font-lobster)' }}>Text</p>`}
            </pre>
          </div>
          <div>
            <h3 className="font-medium text-slate-800 mb-2">3. Using Tailwind (if configured):</h3>
            <pre className="bg-slate-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`// In tailwind.config.js fontFamily section:
fontFamily: {
  'goldman': ['Goldman', 'sans-serif'],
  'lobster': ['Lobster', 'cursive'],
}`}
            </pre>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 className="font-medium text-amber-800 mb-2">📁 Font Files Setup:</h3>
        <p className="text-amber-700 text-sm mb-3">
          To use these fonts, download the font files and place them in:
        </p>
        <ul className="text-amber-700 text-sm space-y-1 ml-4">
          <li>• <code>src/fonts/Goldman/Goldman-Regular.ttf</code></li>
          <li>• <code>src/fonts/Goldman/Goldman-Bold.ttf</code></li>
          <li>• <code>src/fonts/Lobster/Lobster-Regular.ttf</code></li>
        </ul>
        <p className="text-amber-700 text-sm mt-3">
          You can download these fonts from Google Fonts or other font repositories.
        </p>
      </div>
    </div>
  );
};

export default FontDemo;