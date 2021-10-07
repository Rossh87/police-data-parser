import { Either, isRight, left, right, Validator, Validators } from './policeDataTypes';

export interface FieldMap {
	recordIdentifier: string;
	linkingIdentifier: string;
	callTime: string;
	dispatchTime: string;
	arrivalTime: string;
	incidentLat: string;
	incidentLong: string;
	address: string;
	initialCallReason: string;
	finalCallReason: string;
	policeReportedCallerDemographic: string;
	finalCallerDemographic: string;
	callInitMethod: string;
	callPriority: string;
}

type Fn = (...args: any[]) => any;

const pipe =
	(...fns: Fn[]) =>
	(x: any) =>
		fns.reduce((res, fn) => fn(res), x);

const onlyOnRight =
	(v: Validator<string, string>) => (s: Either<string, string>) =>
		isRight(s) ? v(s.value) : s;

const fromNullable: Validator<string, string> = (s) =>
	s !== undefined && s !== null && s !== ''
		? right(s)
		: left('Field is nullable or string is empty');

const sensibleLength = (s: string) =>
	s.length > 4 && s.length < 40
		? right(s)
		: left(
				'Value provided for field out of range--less than 4 or more than 40'
		  );

const extendedLength = (s: string) =>
	s.length > 4 && s.length < 250
		? right(s)
		: left(
				'Value provided for field out of range--less than 4 or more than 250'
		  );

const validDecimal = (s: string) =>
	typeof parseInt(s, 10) === 'number'
		? right(s)
		: left('received NaN when attempting to parse to number');

const baseStringValidation = pipe(fromNullable, onlyOnRight(sensibleLength));

const extendedStringValidation = pipe(
	fromNullable,
	onlyOnRight(extendedLength)
);

const coordValidation = pipe(
	fromNullable,
	onlyOnRight(sensibleLength),
	onlyOnRight(validDecimal)
);

const recordIdentifier = baseStringValidation;
const incidentLat = coordValidation;
const incidentLong = coordValidation;
const linkingIdentifier = baseStringValidation;
const callTime = baseStringValidation;
const dispatchTime = baseStringValidation;
const arrivalTime = baseStringValidation;
const address = extendedStringValidation;
const initialCallReason = extendedStringValidation;
const finalCallReason = extendedStringValidation;
const policeReportedCallerDemographic = baseStringValidation;
const finalCallerDemographic = baseStringValidation;
const callInitMethod = baseStringValidation;
const callPriority = coordValidation;

export const validators: Validators = {
	recordIdentifier,
	incidentLat,
	incidentLong,
	linkingIdentifier,
	callTime,
	dispatchTime,
	arrivalTime,
	address,
	initialCallReason,
	finalCallReason,
	policeReportedCallerDemographic,
	finalCallerDemographic,
	callInitMethod,
	callPriority,
};
