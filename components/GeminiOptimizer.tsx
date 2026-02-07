
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, BrainCircuit, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';

interface Props {
  data: any;
}

const GeminiOptimizer: React.FC<Props> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const analyzeNetwork = async () => {
    setLoading(true);
    try {
      // Fix: Always initialize the GoogleGenAI client with the current environment's API_KEY.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Analise a seguinte estrutura de rede e forneça recomendações profissionais de segurança, escalabilidade e performance.
        A estrutura inclui:
        Equipamentos: ${JSON.stringify(data.equipment)}
        IPAM: ${JSON.stringify(data.ipam)}
        Mapeamento de Portas: ${JSON.stringify(data.mappings)}
        WAN: ${JSON.stringify(data.wan)}

        Formate a resposta em Markdown com:
        1. Resumo da Saúde da Rede
        2. Vulnerabilidades ou Erros Encontrados (ex: falta de VLAN, IPs conflitando, falta de redundância)
        3. Sugestões de Melhoria (Best Practices)
        4. Próximos passos para expansão.
      `;

      // Fix: Using gemini-3-pro-preview for complex reasoning and audit tasks as per guidelines.
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: 'Você é um arquiteto sênior de redes (CCIE) especializado em segurança e infraestrutura empresarial.'
        }
      });

      // Fix: Direct access to the .text property of GenerateContentResponse.
      setReport(response.text || "Não foi possível gerar a análise.");
    } catch (error) {
      console.error(error);
      setReport("Ocorreu um erro ao consultar a IA. Verifique sua conexão ou configuração.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
           <BrainCircuit size={140} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-blue-200" size={28} />
            <h2 className="text-3xl font-bold">Otimizador Inteligente</h2>
          </div>
          <p className="text-blue-100 mb-6 text-lg max-w-xl">
            Utilize o poder do Gemini AI para analisar sua topologia de rede, identificar falhas de segurança e receber sugestões de otimização baseadas em práticas recomendadas da indústria.
          </p>
          <button 
            onClick={analyzeNetwork}
            disabled={loading}
            className="bg-white text-blue-700 px-8 py-3 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-50 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <BrainCircuit size={20} />}
            {loading ? 'Analisando Estrutura...' : 'Gerar Análise Profissional'}
          </button>
        </div>
      </div>

      {report && (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-inner animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 mb-6 text-slate-800">
            <Lightbulb className="text-amber-500" size={24} />
            <h3 className="text-xl font-bold">Relatório de Diagnóstico</h3>
          </div>
          <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-strong:text-blue-700 text-slate-600 whitespace-pre-line">
            {report}
          </div>
          <div className="mt-10 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-4">
            <AlertTriangle className="text-amber-600 shrink-0" size={24} />
            <p className="text-xs text-amber-800 font-medium">
              Nota: Este relatório é gerado por inteligência artificial e deve ser validado por um profissional certificado antes de qualquer alteração física ou lógica na infraestrutura.
            </p>
          </div>
        </div>
      )}
      
      {!report && !loading && (
         <div className="text-center py-20 text-slate-300">
            <p>Clique no botão acima para iniciar a auditoria da rede.</p>
         </div>
      )}
    </div>
  );
};

export default GeminiOptimizer;
