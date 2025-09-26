import LayoutPage from './Layout_Page';
import './style.css';
import { FiltersTabelaChamadosProvider } from '../../../contexts/Filters_Context';
import { FiltersTabelaOsProvider } from '../../../contexts/Filters_Context_Dia';

export default function TabelaChamadosRecursosPage() {
   return (
      <FiltersTabelaChamadosProvider>
         <FiltersTabelaOsProvider>
            <LayoutPage />
         </FiltersTabelaOsProvider>
      </FiltersTabelaChamadosProvider>
   );
}
