import type { Formula } from '../types';

export interface FormulaResult {
  isActive: boolean;
  output: {
    variableName?: string;
    value?: string | number;
  } | null;
  error: string | null;
}

class FormulaService {
  /**
   * Evaluates a list of formula objects in order.
   * @param formulas The array of formula objects.
   * @param context An object mapping variable names to their values (string or number).
   * @returns A record mapping formula IDs to their evaluation results.
   */
  public evaluateFormulaList(
    formulas: Formula[],
    context: Record<string, number | string>
  ): Record<string, FormulaResult> {
    const results: Record<string, FormulaResult> = {};
    const localContext = { ...context };

    for (const formula of formulas) {
      try {
        const isConditionActive = this.evaluateCondition(formula.condition, localContext);

        if (!isConditionActive) {
          results[formula.id] = { isActive: false, output: null, error: null };
          continue;
        }
        
        const actionMatch = formula.action.trim().match(/^([a-zA-Z0-9_]+)\s*=\s*(.*)$/);

        if (!actionMatch) {
            throw new Error('Ação inválida. Use o formato: variavel = expressao');
        }

        const [, varName, expression] = actionMatch;
        const value = this.evaluateExpression(expression, localContext);
        
        // Update context for subsequent formulas in the same list
        localContext[varName] = value;

        results[formula.id] = {
          isActive: true,
          output: { variableName: varName, value },
          error: null,
        };

      } catch (e: any) {
        results[formula.id] = {
          isActive: false, 
          output: null,
          error: e.message,
        };
      }
    }
    return results;
  }
  
  /**
   * Evaluates a single mathematical, conditional, or string expression.
   * @param expression The expression string to evaluate.
   * @param context A record of variable names to their values.
   * @returns The result of the evaluation (string or number).
   */
  private evaluateExpression(expression: string, context: Record<string, number | string>): string | number {
    const expr = expression.trim();
    
    // Handle explicit strings first, they don't need evaluation
    const stringMatch = expr.match(/^"(.*)"$|^'(.*)'$/);
    if (stringMatch) {
        return stringMatch[1] || stringMatch[2] || '';
    }
    
    // Use Function constructor for safe evaluation with context
    const contextKeys = Object.keys(context);
    const contextValues = Object.values(context);

    try {
      const func = new Function(...contextKeys, `return ${expr}`);
      return func(...contextValues);
    } catch (e) {
      throw new Error(`Erro ao avaliar a expressão: "${expression}"`);
    }
  }
  
  /**
   * Evaluates a condition string.
   * @param conditionStr The condition string.
   * @param context The variable context.
   * @returns A boolean result of the condition.
   */
  private evaluateCondition(conditionStr: string, context: Record<string, number | string>): boolean {
    if (conditionStr.trim().toLowerCase() === 'true') return true;

    const contextKeys = Object.keys(context);
    const contextValues = Object.values(context);
    
    // Sanitize common operators for JavaScript compatibility
    const sanitizedCondition = conditionStr
        .replace(/<>/g, '!==')
        .replace(/==/g, '===')
        .replace(/AND/gi, '&&')
        .replace(/OR/gi, '||');

    try {
        const func = new Function(...contextKeys, `return (${sanitizedCondition})`);
        const result = func(...contextValues);
        if (typeof result !== 'boolean') {
            throw new Error(`A condição não resultou em um valor booleano (true/false).`);
        }
        return result;
    } catch (e: any) {
        throw new Error(`Condição inválida: ${conditionStr}. Detalhes: ${e.message}`);
    }
  }
}

export const formulaService = new FormulaService();
