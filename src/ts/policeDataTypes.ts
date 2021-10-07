// map normalized properties to their name in a particular data sheet
export interface FieldMap {
	recordIdentifier: string,
	linkingIdentifier: string,
	callTime: string,
	dispatchTime: string,
	arrivalTime: string,
	incidentLat: string,
	incidentLong: string,
	address: string,
	initialCallReason: string,
	finalCallReason: string,
	policeReportedCallerDemographic: string,
	finalCallerDemographic: string,
	callInitMethod: string,
	callPriority: string
}

export type UserDefinedFieldMap = Partial<FieldMap> & {recordIdentifier: string}

export interface Validator<E, A> {
	(u: any) : Either<E,A>
}

export type Validators = {[k in keyof FieldMap]: Validator<string, string>}

export interface ResultMeta {
	rowsProcessed: number,
	fieldValidityRates: {[k in keyof Partial<FieldMap>]: number},
	closureDiscrepancyCount: number,
	fieldErrors: FieldError[],
}

export interface FieldError {
	rowIdentifier: string,
	fieldName: string,
	failureReason: string
}

export interface Left<E> {
	__tag: 'left',
	value: E
}

export interface Right<T>{
	__tag: 'right',
	value: T
}
export type Either<E,A> = Left<E> | Right<A>

export const isLeft = <E,A>(v: Either<E,A>): v is Left<E> => v.__tag === 'left'

export const isRight = <E,A>(v: Either<E,A>): v is Right<A> => v.__tag === 'right'

export const right = <T>(s:T): Right<T> => ({__tag: 'right', value: s})

export const left = (s:string): Left<string> => ({__tag: 'left', value: s})