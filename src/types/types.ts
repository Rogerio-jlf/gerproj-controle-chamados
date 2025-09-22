export interface TabelaChamadosProps {
   COD_CHAMADO: number;
   DATA_CHAMADO: string;
   HORA_CHAMADO: string;
   SOLICITACAO_CHAMADO: string;
   CONCLUSAO_CHAMADO: string | null;
   STATUS_CHAMADO: string;
   DTENVIO_CHAMADO: string | null;
   COD_RECURSO: number;
   CLIENTE_CHAMADO: string;
   CODTRF_CHAMADO: number;
   COD_CLIENTE: number;
   SOLICITACAO2_CHAMADO: string;
   ASSUNTO_CHAMADO: string;
   EMAIL_CHAMADO: string;
   PRIOR_CHAMADO: number;
   COD_CLASSIFICACAO: number;
   // =====
   NOME_RECURSO: string;
   // =====
   NOME_CLIENTE: string;
}
// ================================================================================

export interface TabelaOSProps {
   COD_OS: string;
   CODTRF_OS: string;
   DTINI_OS: string | null;
   HRINI_OS: string | null;
   HRFIM_OS: string | null;
   OBS_OS: string;
   STATUS_OS: string;
   PRODUTIVO_OS: string;
   CODREC_OS: string;
   PRODUTIVO2_OS: string;
   RESPCLI_OS: string;
   REMDES_OS: string;
   ABONO_OS: string;
   DESLOC_OS: string;
   OBS: string;
   DTINC_OS: string | null;
   FATURADO_OS: string;
   PERC_OS: string | null;
   COD_FATURAMENTO: string;
   COMP_OS: string;
   VALID_OS: string;
   VRHR_OS: string | null;
   NUM_OS: string;
   CHAMADO_OS: string;
   // =====
   COD_CHAMADO: string;
   COD_CLIENTE: string;
   NOME_CLIENTE: string;
   COD_TAREFA: string;
   NOME_TAREFA: string;
   QTD_HR_OS?: number;
}
// ================================================================================

// Interface para a tabela TAREFA
export interface DBTarefaProps {
   COD_TAREFA: number;
   NOME_TAREFA: string;
   CODREC_TAREFA: number;
   DTSOL_TAREFA: string;
   HREST_TAREFA: number;
   codChamado?: number;
}
// ================================================================================
