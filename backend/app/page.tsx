export default function Home() {
  return (
    <main className="min-h-screen bg-[#0d1117] text-[#c9d1d9] p-8 font-mono">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[#58a6ff] mb-2">
          API Gota a Gota - Backend
        </h1>
        <p className="text-[#8b949e] mb-8">
          Sistema de creditos con Express + MongoDB. Usa Postman para probar los endpoints.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#f0f6fc] mb-4 border-b border-[#30363d] pb-2">
            Estructura del Proyecto
          </h2>
          <pre className="bg-[#161b22] p-4 rounded-lg text-sm leading-relaxed border border-[#30363d]">
{`gota-gota-backend/
  .env
  server.js
  package.json
  models/
    Cobrador.js
    Cliente.js
    Credito.js
  routes/
    cobradores.js
    clientes.js
    creditos.js`}
          </pre>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#f0f6fc] mb-4 border-b border-[#30363d] pb-2">
            Endpoints para Postman
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#58a6ff] mb-3">Cobradores</h3>
              <div className="bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden">
                <EndpointRow method="POST" path="/cobradores" desc="Crear cobrador" />
                <EndpointRow method="GET" path="/cobradores" desc="Listar todos" />
                <EndpointRow method="GET" path="/cobradores/:id" desc="Obtener por ID" />
                <EndpointRow method="PUT" path="/cobradores/:id" desc="Actualizar" />
                <EndpointRow method="DELETE" path="/cobradores/:id" desc="Eliminar" />
                <EndpointRow method="GET" path="/cobradores/:id/clientes" desc="Clientes de un cobrador" highlight />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#58a6ff] mb-3">Clientes</h3>
              <div className="bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden">
                <EndpointRow method="POST" path="/clientes" desc="Crear cliente" />
                <EndpointRow method="GET" path="/clientes" desc="Listar todos" />
                <EndpointRow method="GET" path="/clientes/:id" desc="Obtener por ID" />
                <EndpointRow method="PUT" path="/clientes/:id" desc="Actualizar" />
                <EndpointRow method="DELETE" path="/clientes/:id" desc="Eliminar" />
                <EndpointRow method="GET" path="/clientes/:id/creditos" desc="Creditos de un cliente" highlight />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#58a6ff] mb-3">Creditos</h3>
              <div className="bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden">
                <EndpointRow method="POST" path="/creditos" desc="Crear credito" />
                <EndpointRow method="GET" path="/creditos" desc="Listar todos" />
                <EndpointRow method="GET" path="/creditos/:id" desc="Obtener por ID" />
                <EndpointRow method="PUT" path="/creditos/:id" desc="Actualizar" />
                <EndpointRow method="DELETE" path="/creditos/:id" desc="Eliminar" />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#f0f6fc] mb-4 border-b border-[#30363d] pb-2">
            Ejemplos de Body JSON para Postman
          </h2>

          <div className="space-y-4">
            <JsonExample
              title="Crear Cobrador (POST /cobradores)"
              json={`{
  "nombre": "Jairo Lopez",
  "celular": "3001234567",
  "direccion": "Calle 10 #5-20, Cali",
  "cedula": "1234567890"
}`}
            />
            <JsonExample
              title="Crear Cliente (POST /clientes)"
              json={`{
  "nombre": "Juan Perez",
  "cc": "9876543210",
  "direccion": "Barrio El Centro, Carrera 3",
  "celular": "3109876543",
  "cobradorId": "PEGAR_ID_DEL_COBRADOR_AQUI"
}`}
            />
            <JsonExample
              title="Crear Credito (POST /creditos)"
              json={`{
  "fechaOrigen": "2026-02-10",
  "fechaPago": "2026-03-10",
  "montoPrestado": 500000,
  "montoPorPagar": 550000,
  "clienteId": "PEGAR_ID_DEL_CLIENTE_AQUI",
  "cobradorId": "PEGAR_ID_DEL_COBRADOR_AQUI",
  "estado": "pendiente"
}`}
            />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#f0f6fc] mb-4 border-b border-[#30363d] pb-2">
            Como ejecutar
          </h2>
          <pre className="bg-[#161b22] p-4 rounded-lg text-sm leading-relaxed border border-[#30363d]">
{`# 1. Instalar dependencias
npm install

# 2. Configurar .env con tu URI de MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/gotagota

# 3. Iniciar el servidor
npm run dev

# 4. Probar en Postman → http://localhost:3000`}
          </pre>
        </section>
      </div>
    </main>
  );
}

function EndpointRow({ method, path, desc, highlight = false }: {
  method: string;
  path: string;
  desc: string;
  highlight?: boolean;
}) {
  const methodColors: Record<string, string> = {
    GET: 'text-[#3fb950]',
    POST: 'text-[#d29922]',
    PUT: 'text-[#58a6ff]',
    DELETE: 'text-[#f85149]',
  };

  return (
    <div className={`flex items-center gap-4 px-4 py-2 border-b border-[#30363d] last:border-b-0 ${highlight ? 'bg-[#1c2533]' : ''}`}>
      <span className={`font-bold text-xs w-16 ${methodColors[method] || 'text-[#c9d1d9]'}`}>
        {method}
      </span>
      <code className="text-sm text-[#c9d1d9] flex-1">{path}</code>
      <span className="text-xs text-[#8b949e]">{desc}</span>
    </div>
  );
}

function JsonExample({ title, json }: { title: string; json: string }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-[#f0f6fc] mb-2">{title}</h4>
      <pre className="bg-[#161b22] p-4 rounded-lg text-sm leading-relaxed border border-[#30363d] text-[#7ee787]">
        {json}
      </pre>
    </div>
  );
}
