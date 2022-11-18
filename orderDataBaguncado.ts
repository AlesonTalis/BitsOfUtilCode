import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DadosTempoRealDataType, DateType, OrderDadosDatas, OrderDadosDatasGrouped, PontoControleGroup } from '../Types/Dashboard/DadosTempoRealType';

import { MessageService } from './message.service';
import { DadosTempoRealDataMock } from './Mock/mock-dashboard';

enum DIVISIONS_NAMES {
  seconds = 0,
  minutes,
  hours,
  days,
  weeks,
  months,
  years
}

const DIVISIONS = [
	{amount: 60, name: DIVISIONS_NAMES.seconds },
	{amount: 60, name: DIVISIONS_NAMES.minutes },
	{amount: 24, name: DIVISIONS_NAMES.hours },
	{amount: 7, name: DIVISIONS_NAMES.days },
	{amount: 4.34524, name: DIVISIONS_NAMES.weeks },
	{amount: 12, name: DIVISIONS_NAMES.months },
	{amount: Number.POSITIVE_INFINITY, name: DIVISIONS_NAMES.years },
]

const getLastInDate = (name: DIVISIONS_NAMES, date: Date, amount: number = 1) : Date => {
  var ind = name as number
  var m = 1000

  for (let i = 0; i < name; i-=-1)
  {
    m = m * DIVISIONS[i].amount * (i === name - 1 ? amount : 1)
  }

  var ndate = new Date(date.getTime() - m)

  return ndate
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private messageService: MessageService) { }

  async getDadosTempoReal(): Promise<Observable<DadosTempoRealDataType[]|any[]>> {
    this.messageService.add('Fetching DadosTempoReal')

    var dados = await DadosTempoRealDataMock(5000)

    // ordenar os dados por 'tipo_PontoControle'
    var groups = await this.orderPontoControle(dados as DadosTempoRealDataType[])
      .then(d => {
        return d
      })

    // pega os grupos e agrupa novamente por datas, sendo "mês, semana, dia e hora"
    var grupos = groups.map(m => {
      var group = this.orderDatas(m.dados)

      return group
    }).filter(g => g.length > 0)

    console.log({groups, grupos})
    getLastInDate(DIVISIONS_NAMES.minutes, new Date(), 10)

    return of(dados)
  }

  async orderPontoControle(dados: DadosTempoRealDataType[]): Promise<PontoControleGroup[]>
  {
    var groups: PontoControleGroup[] = []
    var pontos: number[] = []
    // as posições serão as mesmas nas duas listas

    dados.forEach(d => {
      var id = pontos.indexOf(d.tipo_PontoControle!)
      if (id !== -1)
      {
        // se existe, adiciona o valor dentro do 'groups'
        groups[id].dados.push(d)
      }
      else
      {
        pontos.push(d.tipo_PontoControle!)
        groups.push({
          pontoControle: d.tipo_PontoControle!,
          dados: [d]
        })
      }
    })

    return groups
  }

  orderDatas(dados: DadosTempoRealDataType[]): OrderDadosDatasGrouped[]
  {
    var groups: OrderDadosDatas[] = []
    // já que serão "poucos dados", não será problema de ordenar:
    // datas máximas:
    var mmes = getLastInDate(DIVISIONS_NAMES.months, new Date())
    var myear = getLastInDate(DIVISIONS_NAMES.years, new Date())
    var mdia = getLastInDate(DIVISIONS_NAMES.days, new Date())

    // console.log({mmes,myear,mdia})

    dados.forEach(d => {
      // em mes, os valores serão limitados a um ano
      // em sem, os valores serão limitados a um ano
      // em dia, os valores serão limitados a um mes
      // em hora, os valores serão limitados a um dia
      // futuramente...


      // meses
      if (d.data_Inicio?.getTime()! > myear.getTime())
      {
        var mes = d.data_Inicio?.getMonth()
        var mes_ = groups.map(g => g.dateValue).indexOf(mes!)

        if (mes_ !== -1 && groups[mes_].dateType==='mes') groups[mes_].data.push(d)
        else groups.push({ dateType: 'mes', dateValue: mes!, data: [d] })
      }

      // semanas
      if (d.data_Inicio?.getTime()! > myear.getTime())
      {
        var sem = this.getWeek(d.data_Inicio)
        var sem_ = groups.map(g => g.dateValue).indexOf(sem!)

        if (sem_ !== -1 && groups[sem_].dateType==='semana') groups[sem_].data.push(d)
        else groups.push({ dateType: 'semana', dateValue: sem!, data: [d] })
      }

      // dias
      if (d.data_Inicio?.getTime()! > mmes.getTime())
      {
        var dia = d.data_Inicio?.getDate()
        var dia_ = groups.map(g => g.dateValue).indexOf(dia!)

        if (dia_ !== -1 && groups[dia_].dateType==='dia') groups[dia_].data.push(d)
        else groups.push({ dateType: 'dia', dateValue: dia!, data: [d] })
      }

      // horas
      // limitado a um dia
      if (d.data_Inicio?.getTime()! > mdia.getTime())
      {
        var hour = d.data_Inicio?.getHours()
        var hour_ = groups.map(g => g.dateValue).indexOf(hour!)

        if (hour_ !== -1 && groups[hour_].dateType==='hora') groups[hour_].data.push(d)
        else groups.push({ dateType: 'hora', dateValue: hour!, data: [d] })
      }
    })

    // com valores agrupados, salva as quantidades:
    // bla bla bla

    var grouped: OrderDadosDatasGrouped[] = []
    var _groups: DateType[] = []

    groups.forEach(g => {
      var i = _groups.indexOf(g.dateType)
      if (i !== -1)
      {
        grouped[i].dados.push(g)
      }
      else
      {
        grouped.push({dateType: g.dateType, dados: [g]})
        _groups.push(g.dateType)
      }
    })

    // console.log({groups, dados})

    grouped.map(g => {
      g.dados = g.dados.map(m => {
        m.dateMin = new Date()
        m.dateMax = new Date(0,0,0)

        m.data.forEach(d => {
          if (d.data_Inicio?.getTime()! > m.dateMax?.getTime()!) m.dateMax = d.data_Inicio
          if (d.data_Inicio?.getTime()! < m.dateMin?.getTime()!) m.dateMin = d.data_Inicio
        })

        return m
      }).sort((a,b) => a.dateValue - b.dateValue)
      return g
    })


    return grouped
  }

  getWeek(date: Date|undefined): number
  {
    if (typeof date === undefined) return 0

    date = date as Date

    var onejan = new Date(date.getFullYear(), 0, 1)// expliquem isso!
    var today = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    var dayOfYear = (((today.getTime() - onejan.getTime()) + 86400000)/86400000)

    return Math.ceil(dayOfYear / 7)
  }

}
