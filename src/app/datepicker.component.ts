import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from "@angular/core";

interface Day {
    day: number;
    monthOffset: -1 | 0 | 1; // mes anterior, actual, siguiente
}

@Component({
    selector: 'app-datepicker',
    templateUrl: './datepicker.component.html',
    styleUrls: ['./datepicker.component.scss']
})
export class DatepickerComponent implements OnInit, OnChanges {

    @Input() fechaSeleccionada!: Date; // fecha que recibe del padre
    @Output() dateSelected = new EventEmitter<Date>();
    @Output() fechaSeleccionadaChange = new EventEmitter<Date>();

    currentMonth!: number;
    currentYear!: number;
    selectedDay: Day;
    daysInMonth: Day[] = [];
    weekDays = ['D','L','M','X','J','V','S'];
    years: number[] = [];
    months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    currentDate: Date = new Date();

    ngOnInit() {
        const initialDate = this.fechaSeleccionada || new Date();
        console.log(initialDate);

        this.currentMonth = initialDate.getMonth();
        this.currentYear = initialDate.getFullYear();

        for(let y = this.currentYear; y >= 1990; y--) {
            this.years.push(y)
        }

        this.generateCalendar(this.currentMonth, this.currentYear);
        this.selectedDay = { day: initialDate.getDate(), monthOffset: 0};
    }

    // Si la fecha puede cambiar mientras el hija esta activado
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['fechaSeleccionada'] && this.fechaSeleccionada) {
            const nuevaFecha = changes['fechaSeleccionada'].currentValue as Date;

            // comparamos con al fecha actual interna
            const fechaInterna = this.selectedDay
            ? new Date(this.currentYear, this.currentMonth, this.selectedDay.day) : null;

            if (!fechaInterna || nuevaFecha.getTime() !== fechaInterna.getTime()) {
                // Actualizamos solo si realmente es distinta
                this.currentYear = nuevaFecha.getMonth();
                this.currentMonth = nuevaFecha.getFullYear();
                this.selectedDay = { day: nuevaFecha.getDate(), monthOffset: 0 };
                this.generateCalendar(this.currentMonth, this.currentYear);
            }
        }
    }

    generateCalendar(month: number, year: number){
        this.daysInMonth = [];

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

        // Dias del mes anterior
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for(let i = firstDayOfMonth - 1; i >= 0; i--) {
            this.daysInMonth.push({ day: prevMonthLastDay - i, monthOffset: -1 });
        }

        // Dias del mes actual
        for(let i = 1; i <= lastDayOfMonth; i++) {
            this.daysInMonth.push({ day: i, monthOffset: 0 });
        }

        // Dias del mes siguiente
        const totalCells = Math.ceil(this.daysInMonth.length / 7) * 7;
        for (let i = 1; this.daysInMonth.length < totalCells; i++) {
            this.daysInMonth.push({ day: i, monthOffset: 1});
        }
    }

    onMonthOrYearChange() {
        const nuevaFecha = new Date(this.currentYear, this.currentMonth, 1);
        this.dateSelected.emit(nuevaFecha)
        this.generateCalendar(this.currentMonth, this.currentYear);
    }

    isToday(day: Day): boolean {
        const today = new Date();
        return  day.monthOffset === 0 && day.day === today.getDate() &&
                this.currentMonth === today.getMonth() && 
                this.currentYear === today.getFullYear();
    }

    selectDay(day: Day) {
        if (day.monthOffset !== 0) {
            if (day.monthOffset === -1) {
                this.prevMonth();
            } else {
                this.nextMonth();
            }
        }

        // Ahora seteamos el dia
        this.selectedDay = { day: day.day, monthOffset: 0 };

        // Creamos la fecha exacta
        const nuevaFecha = new Date(this.currentYear, this.currentMonth, this.selectedDay.day);

        //Emitimos al padre
        this.dateSelected.emit(nuevaFecha);

        // Regeneramos el calendario solo si cambio de mes
        this.generateCalendar(this.currentMonth, this.currentYear);
    }

    prevMonth() {
        if (this.currentMonth === 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else {
            this.currentMonth--;
        }
        this.generateCalendar(this.currentMonth, this.currentYear);
    }

    nextMonth() {
        if (this.currentMonth === 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else {
            this.currentMonth++;
        }
        this.generateCalendar(this.currentMonth, this.currentYear);
    }

    emitSelectedDate(month?: number, year?: number) {
        if (!this.selectedDay) return;
        const date = new Date(this.currentYear, this.currentMonth, this.selectedDay.day);
        this.dateSelected.emit(date);
    }

}
