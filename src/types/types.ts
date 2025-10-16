export interface TabelaChamadoProps {
   COD_CHAMADO: number;
   DATA_CHAMADO: string;
   HORA_CHAMADO: string;
   SOLICITACAO_CHAMADO?: string | null;
   CONCLUSAO_CHAMADO?: string | null;
   STATUS_CHAMADO: string;
   DTENVIO_CHAMADO?: string | null;
   COD_RECURSO?: number | null;
   CLIENTE_CHAMADO?: string | null;
   CODTRF_CHAMADO?: number | null;
   COD_CLIENTE?: number | null;
   SOLICITACAO2_CHAMADO?: string | null;
   ASSUNTO_CHAMADO?: string | null;
   EMAIL_CHAMADO?: string | null;
   PRIOR_CHAMADO: number;
   COD_CLASSIFICACAO: number;
   // =====
   DATA_HORA_CHAMADO?: string | null;
   // =====
   NOME_RECURSO?: string | null;
   // =====
   NOME_CLIENTE?: string | null;
   // =====
   NOME_CLASSIFICACAO?: string | null;
   // =====
   NOME_TAREFA?: string | null;
   // =====
   TAREFA_COMPLETA?: string | null;
   // =====
   NOME_PROJETO?: string | null;
   // ======
   PROJETO_COMPLETO?: string | null;
}

// ================================================================================

export interface TabelaOSProps {
   COD_OS: number;
   CODTRF_OS: number;
   DTINI_OS: string;
   HRINI_OS: string;
   HRFIM_OS: string;
   OBS_OS?: string | null;
   STATUS_OS: number;
   PRODUTIVO_OS: 'SIM' | 'NAO';
   CODREC_OS: number;
   PRODUTIVO2_OS: 'SIM' | 'NAO';
   RESPCLI_OS: string;
   REMDES_OS: 'SIM' | 'NAO';
   ABONO_OS: 'SIM' | 'NAO';
   DESLOC_OS?: string | null;
   OBS?: string | null;
   DTINC_OS: string;
   FATURADO_OS: 'SIM' | 'NAO';
   PERC_OS: number;
   COD_FATURAMENTO?: number | null;
   COMP_OS?: string | null;
   VALID_OS: 'SIM' | 'NAO';
   VRHR_OS: number;
   NUM_OS?: string | null;
   CHAMADO_OS?: string | null;
   // =====
   COD_CHAMADO: number;
   // =====
   COD_RECURSO: number;
   NOME_RECURSO: string;
   // =====
   COD_CLIENTE: number;
   NOME_CLIENTE: string;
   // =====
   COD_TAREFA: number;
   NOME_TAREFA: string;
   // =====
   QTD_HR_OS?: number;
}
// ================================================================================

export interface TabelaTarefaProps {
   COD_TAREFA: number;
   NOME_TAREFA: string;
   CODPRO_TAREFA: number;
   CODREC_TAREFA: number;
   DTSOL_TAREFA?: Date | null;
   DTAPROV_TAREFA?: Date | null;
   DTPREVENT_TAREFA?: Date | null;
   HREST_TAREFA?: number | null;
   HRATESC_TAREFA?: number | null;
   MARGEM_TAREFA: 'SIM' | 'NAO';
   STATUS_TAREFA: number;
   ORDEM_TAREFA: number;
   COD_AREA: number;
   ESTIMADO_TAREFA: 'SIM' | 'NAO';
   COD_TIPOTRF: number;
   CODRECRESP_TAREFA: number;
   HRREAL_TAREFA?: number | null;
   FATEST_TAREFA: 'SIM' | 'NAO';
   COD_FASE: number;
   VALINI_TAREFA: Date;
   VALFIM_TAREFA: Date;
   PERIMP_TAREFA: 'SIM' | 'NAO';
   DTINC_TAREFA: Date;
   PERC_TAREFA: number;
   FATURA_TAREFA: 'SIM' | 'NAO';
   VALIDA_TAREFA: number;
   VRHR_TAREFA: number;
   OBS_TAREFA?: string | null;
   LIMMES_TAREFA?: number | null;
   EXIBECHAM_TAREFA?: number | null;
   // =====
   COD_RECURSO: number;
   NOME_RECURSO: string;
}
// ================================================================================
export interface TabelaProjetoProps {
   COD_PROJETO: number;
   NOME_PROJETO: string;
   CODCLI_PROJETO: number;
   RESPCLI_PROJETO: string;
   PROPOSTA_PROJETO: string | null;
   CODREC_PROJETO: number;
   PERC_PROJETO: number;
   LOGINC_PROJETO: string | null;
   LOGALT_PROJETO: string | null;
   QTDHORAS_PROJETO: number;
   STATUS_PROJETO: 'ATI' | 'ENC';
   // =====
   COD_CLIENTE: number;
   NOME_CLIENTE: string;
   // =====
   COD_RECURSO: number;
   NOME_RECURSO: string;
   // =====
   PROJETO_COMPLETO?: string | null;
   CLIENTE_COMPLETO?: string | null;
   RECURSO_COMPLETO?: string | null;
}
// ================================================================================

export interface TabelaRecursoProps {
   COD_RECURSO: number;
   NOME_RECURSO: string;
   FONE_RECURSO?: string | null;
   ATIVO_RECURSO: number;
   CODUSR_RECURSO: number;
   COD_NIVEL: number;
   HRDIA_RECURSO?: string | null;
   PERCPROD_RECURSO?: number | null;
   EMAIL_RECURSO?: string | null;
   DTLIMITE_RECURSO?: Date | null;
   PERMAPO_RECURSO: 'SIM' | 'NAO';
   MATR_RECURSO?: string | null;
   OBS_RECURSO?: string | null;
   CUSTO_RECURSO?: number | null;
   RECEITA_RECURSO?: number | null;
   TPCUSTO_RECURSO: number;
   CEL_RECURSO?: string | null;
   ANIVERSARIO_RECURSO?: string | null;
   // =====
   CODREC_TAREFA?: number | null;
}
// ================================================================================

export interface TabelaClassificacaoProps {
   COD_CLASSIFICACAO: number;
   NOME_CLASSIFICACAO: string;
   ATIVO_CLASSIFICACAO?: 'SIM' | 'NAO';
}
// ================================================================================

export interface InputGlobalFilterProps {
   value: string;
   onChange: (value: string) => void;
   placeholder?: string;
   onClear: () => void;
}
// ================================================================================

export interface InputFilterTableHeaderProps {
   value: string;
   onChange: (value: string) => void;
   placeholder?: string;
   type?: string;
   onClear?: () => void;
}
// ================================================================================
