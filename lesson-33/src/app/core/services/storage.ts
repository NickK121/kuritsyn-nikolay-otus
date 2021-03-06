import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, from, NEVER, Observable, of, Subject } from 'rxjs';
import { filter, flatMap, map, switchMap, tap } from 'rxjs/operators';
import { WordTranslate } from '../models/word-translate';
import { TranslateService } from './translate';

const WORD_REMEMBERS = 'WORD_REMEMBERS';

@Injectable()
export class DBService {
	public listChange$ = new Subject<Array<WordTranslate>>();
	private _list: Array<WordTranslate> = [];

	constructor(private translateService: TranslateService) {
		// this._list = this.GetListOfWord();
	}

	GetWord(word: string, fromLang: string): Observable<WordTranslate> {
		const res = this._list.find(w => w.fromLang === fromLang && w.word === word);
		return res ? of(res) : EMPTY;
	}

	LoadListOfWord(): void {
		const translate = localStorage.getItem(WORD_REMEMBERS);
		if (translate) {
			this._list = JSON.parse(translate) as Array<WordTranslate>;
			this.listChange$.next(this._list);
		}
	}

	StoreWord(word: WordTranslate): void {
		this._list.push(word);
		localStorage.setItem(WORD_REMEMBERS, JSON.stringify(this._list));
		this.listChange$.next(this._list);
	}

	StoreText(text: string, fromLang: string, toLang: string): void {
		const list = text.split(/\s+/);
		const newWords = list.filter(w => !this._list.find(v => v.fromLang === fromLang && v.toLang === toLang && v.word === w));
		this.translateService.sendData({ text: JSON.stringify(newWords), model_id: `${fromLang}-${toLang}` })
			.subscribe(res => newWords.forEach((word, i) => this._list.push({
				fromLang, toLang, word, translate: res.translations[i].translation
			})));
		this.listChange$.next(this._list);
	}
}