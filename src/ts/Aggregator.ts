import { FieldError, isLeft, ResultMeta, UserDefinedFieldMap, Validators } from './policeDataTypes';

export class Aggregator {
	private availableFields: string[];
	private rowCount: number;
	private fieldErrors: FieldError[];
	outcomeDiscrepancyCount: number;
	public constructor(private userDefinedFieldMap: UserDefinedFieldMap, private validators: Validators){
		// @ts-ignore
		this.availableFields = Object.keys(userDefinedFieldMap).filter(key => userDefinedFieldMap[key].length > 0)
		this.rowCount = 0;
		this.fieldErrors = [];
		this.outcomeDiscrepancyCount = 0;
	}

	public ingest(row: Record<string, string>){
		this.rowCount++;
		const rowIdentifier = row[this.userDefinedFieldMap['recordIdentifier']];

		this.availableFields.forEach((availableField) => {
			const recordDefinedKey = this.userDefinedFieldMap[availableField as keyof UserDefinedFieldMap];
			let validationResult;
			try {
				validationResult = this.validators[availableField as keyof UserDefinedFieldMap](row[recordDefinedKey])

			} catch(e){
				console.error(e);
				console.log('availableField is ', availableField);
				console.log('validators is ', this.validators)
			}

			if(isLeft(validationResult)){
				this.fieldErrors.push({
					rowIdentifier,
					fieldName: availableField+':'+recordDefinedKey,
					failureReason: validationResult.value as string
				})
			} 
		});

		if(this.canCompareCallReasons()){
			if(this.hasOutcomeDiscrepancy(row)){
				this.outcomeDiscrepancyCount++;
			}
		}
	}

	public report(): ResultMeta {
		const {rowCount} = this;
		const result: ResultMeta = {
			rowsProcessed: rowCount,
			fieldErrors: this.fieldErrors,
			fieldValidityRates: this.availableFields.reduce((o, f) => {
				o[f] = 1;
				return o;
			}, {} as {[k in string]: number}),
			closureDiscrepancyCount: this.outcomeDiscrepancyCount
		};

		if(this.fieldErrors.length){
			const aggErrs = this.aggregateFieldErrors();
			Object.keys(aggErrs).forEach((errFieldName) => {
				const errRate = aggErrs[errFieldName].length / rowCount;
				const successRate = (1 - errRate).toFixed(4)
				const resultKey = errFieldName.split(':')[0];
				// @ts-ignore
				result.fieldValidityRates[resultKey] = successRate
			})
		}

		return result;
	}

	private aggregateFieldErrors(){
		return this.fieldErrors.reduce((agg, err) => {
			const maybeErrs = agg[err.fieldName];

			if(maybeErrs === undefined) {
				agg[err.fieldName] = [err];
			} else {
				agg[err.fieldName] = maybeErrs.concat(err)
			};

			return agg;
		}, {} as {[k in string]: FieldError[]});
	}

	private hasOutcomeDiscrepancy(row: Record<string, string>){
		const initialCallKey = this.userDefinedFieldMap['initialCallReason'];
		const finalCallKey = this.userDefinedFieldMap['finalCallReason'];
		return row[initialCallKey].trim() === row[finalCallKey].trim();
	}

	private canCompareCallReasons() {
		return this.availableFields.includes('initialCallReason') && this.availableFields.includes('finalCallReason');
	}
}