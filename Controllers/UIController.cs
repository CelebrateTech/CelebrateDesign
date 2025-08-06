using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using System.Net.Http.Headers;

namespace CelebrateDesign.Controllers
{
    public class UIController : Controller
    {
        public IActionResult Welcome()
        {
            return View();
        }
        public IActionResult Overview()
        {
            return View();
        }
        public IActionResult Installation()
        {
            return View();
        }
        public IActionResult Modularity()
        {
            return View();
        }
        public IActionResult Syntax()
        {
            return View();
        }
        public IActionResult Responsive()
        {
            return View();
        }
        public IActionResult Accordion()
        {
            return View();
        }
        public IActionResult Background_Color()
        {
            return View();
        }
        public IActionResult Border_Color()
        {
            return View();
        }
        public IActionResult Box_3D_Animations()
        {
            return View();
        }
        public IActionResult Box_Shadows_InSet()
        {
            return View();
        }
        public IActionResult Box_Shadows_OutSet()
        {
            return View();
        }
        public IActionResult Buttons()
        {
            return View();
        }
        public IActionResult Card()
        {
            return View();
        }
        public IActionResult Checks_And_Radio()
        {
            return View();
        }
        public IActionResult Calendar()
        {
            return View();
        }
        public IActionResult DragAndDrop()
        {
            return View();
        }
        public IActionResult Other_Animations()
        {
            return View();
        }
        public IActionResult Double_Color_Background_Gradient()
        {
            return View();
        }
        public IActionResult Double_Color_Border_Gradient()
        {
            return View();
        }
        public IActionResult Double_Color_Text_Gradient()
        {
            return View();
        }
        public IActionResult Datatables()
        {
            return View();
        }
        public IActionResult DropDown()
        {
            return View();
        }
        public IActionResult Editor()
        {
            return View();
        }
        public IActionResult Keypad()
        {
            return View();
        }
        public IActionResult Multi_Box_Animations()
        {
            return View();
        }
        public IActionResult Multi_Select_DropDown()
        {
            return View();
        }
        public IActionResult Pagination()
        {
            return View();
        }
        public IActionResult Progress_Bar()
        {
            return View();
        }
        public IActionResult PopUp()
        {
            return View();
        }
        public IActionResult QtySelector()
        {
            return View();
        }
        public IActionResult Single_Box_Animations()
        {
            return View();
        }
        public IActionResult Single_Color_Background_Gradient()
        {
            return View();
        }
        public IActionResult Single_Color_Border_Gradient()
        {
            return View();
        }
        public IActionResult Single_Color_Text_Gradient()
        {
            return View();
        }
        public IActionResult Skeleton()
        {
            return View();
        }
        public IActionResult Suggestion()
        {
            return View();
        }
        public IActionResult Spinners()
        {
            return View();
        }
        public IActionResult Slider()
        {
            return View();
        }
        public IActionResult Triple_Color_Text_Gradient()
        {
            return View();
        }
        public IActionResult Triple_Color_Background_Gradient()
        {
            return View();
        }
        public IActionResult Triple_Color_Border_Gradient()
        {
            return View();
        }
        public IActionResult Toasts()
        {
            return View();
        }
        public IActionResult Gallery()
        {
            return View();
        }
        public IActionResult TextEditor()
        {
            return View();
        }

        public IActionResult Icons()
        {
            return View();
        }

        public IActionResult Tabs()
        {
            return View();
        }
        public IActionResult Theme_Color_Shades()
        {
            return View();
        }
        public IActionResult Text_Color()
        {
            return View();
        }
        public IActionResult Text_Shadow_InSet()
        {
            return View();
        }
        public IActionResult Text_Shadow_OutSet()
        {
            return View();
        }
        public IActionResult TextBoxes()
        {
            return View();
        }
        public IActionResult ToolTip()
        {
            return View();
        }

        //Suggestion code 
        public class SnItem
        {
            /// Suggestion Item Id
            public string? SnItId { get; set; }
            /// Suggestion Item Text
            public string? SnItTt { get; set; }
            /// Suggestion List Category Text
            public string? SnLtCyTt { get; set; }
            /// Suggestion List Caption Text
            public string? SnLtCnTt { get; set; }
            /// Suggestion List Description Text
            public string? SnLtDnTt { get; set; }

            /// Suggestion List Icon Class
            public string? SnLtInCs { get; set; }
        }
        private List<SnItem> Data()
        {
            var data = new List<SnItem>
             {
                new SnItem { SnItId = "1", SnItTt = "Afghanistan", SnLtCyTt = "Asia", SnLtCnTt = "Afghanistan", SnLtDnTt = " Capital : Kabul" },
                new SnItem { SnItId = "2", SnItTt = "Albania", SnLtCyTt = "Europe", SnLtCnTt = "Albania", SnLtDnTt = " Capital : Tirana" },
                new SnItem { SnItId = "3", SnItTt = "Algeria", SnLtCyTt = "Africa", SnLtCnTt = "Algeria", SnLtDnTt = " Capital : Algiers" },
                new SnItem { SnItId = "4", SnItTt = "Andorra", SnLtCyTt = "Europe", SnLtCnTt = "Andorra", SnLtDnTt = " Capital : Andorra la Vella" },
                new SnItem { SnItId = "5", SnItTt = "Angola", SnLtCyTt = "Africa", SnLtCnTt = "Angola", SnLtDnTt = " Capital : Luanda" },
                new SnItem { SnItId = "6", SnItTt = "Antigua and Barbuda", SnLtCyTt = "North America", SnLtCnTt = "Antigua and Barbuda", SnLtDnTt = " Capital : Saint John's" },
                new SnItem { SnItId = "7", SnItTt = "Argentina", SnLtCyTt = "South America", SnLtCnTt = "Argentina", SnLtDnTt = " Capital : Buenos Aires" },
                new SnItem { SnItId = "8", SnItTt = "Armenia", SnLtCyTt = "Asia", SnLtCnTt = "Armenia", SnLtDnTt = " Capital : Yerevan" },
                new SnItem { SnItId = "9", SnItTt = "Australia", SnLtCyTt = "Oceania", SnLtCnTt = "Australia", SnLtDnTt = " Capital : Canberra" },
                new SnItem { SnItId = "10", SnItTt = "Austria", SnLtCyTt = "Europe", SnLtCnTt = "Austria", SnLtDnTt = " Capital : Vienna" },
                new SnItem { SnItId = "11", SnItTt = "Azerbaijan", SnLtCyTt = "Asia", SnLtCnTt = "Azerbaijan", SnLtDnTt = " Capital : Baku" },
                new SnItem { SnItId = "12", SnItTt = "Bahamas", SnLtCyTt = "North America", SnLtCnTt = "Bahamas", SnLtDnTt = " Capital : Nassau" },
                new SnItem { SnItId = "13", SnItTt = "Bahrain", SnLtCyTt = "Asia", SnLtCnTt = "Bahrain", SnLtDnTt = " Capital : Manama" },
                new SnItem { SnItId = "14", SnItTt = "Bangladesh", SnLtCyTt = "Asia", SnLtCnTt = "Bangladesh", SnLtDnTt = " Capital : Dhaka" },
                new SnItem { SnItId = "15", SnItTt = "Barbados", SnLtCyTt = "North America", SnLtCnTt = "Barbados", SnLtDnTt = " Capital : Bridgetown" },
                new SnItem { SnItId = "16", SnItTt = "Belarus", SnLtCyTt = "Europe", SnLtCnTt = "Belarus", SnLtDnTt = " Capital : Minsk" },
                new SnItem { SnItId = "17", SnItTt = "Belgium", SnLtCyTt = "Europe", SnLtCnTt = "Belgium", SnLtDnTt = " Capital : Brussels" },
                new SnItem { SnItId = "18", SnItTt = "Belize", SnLtCyTt = "North America", SnLtCnTt = "Belize", SnLtDnTt = " Capital : Belmopan" },
                new SnItem { SnItId = "19", SnItTt = "Benin", SnLtCyTt = "Africa", SnLtCnTt = "Benin", SnLtDnTt = " Capital : Porto-Novo" },
                new SnItem { SnItId = "20", SnItTt = "Bhutan", SnLtCyTt = "Asia", SnLtCnTt = "Bhutan", SnLtDnTt = " Capital : Thimphu" },
                new SnItem { SnItId = "21", SnItTt = "Bolivia", SnLtCyTt = "South America", SnLtCnTt = "Bolivia", SnLtDnTt = " Capital : Sucre" },
                new SnItem { SnItId = "22", SnItTt = "Bosnia and Herzegovina", SnLtCyTt = "Europe", SnLtCnTt = "Bosnia and Herzegovina", SnLtDnTt = " Capital : Sarajevo" },
                new SnItem { SnItId = "23", SnItTt = "Botswana", SnLtCyTt = "Africa", SnLtCnTt = "Botswana", SnLtDnTt = " Capital : Gaborone" },
                new SnItem { SnItId = "24", SnItTt = "Brazil", SnLtCyTt = "South America", SnLtCnTt = "Brazil", SnLtDnTt = " Capital : Brasília" },
                new SnItem { SnItId = "25", SnItTt = "Brunei", SnLtCyTt = "Asia", SnLtCnTt = "Brunei", SnLtDnTt = " Capital : Bandar Seri Begawan" },
                new SnItem { SnItId = "26", SnItTt = "Bulgaria", SnLtCyTt = "Europe", SnLtCnTt = "Bulgaria", SnLtDnTt = " Capital : Sofia" },
                new SnItem { SnItId = "27", SnItTt = "Burkina Faso", SnLtCyTt = "Africa", SnLtCnTt = "Burkina Faso", SnLtDnTt = " Capital : Ouagadougou" },
                new SnItem { SnItId = "28", SnItTt = "Burundi", SnLtCyTt = "Africa", SnLtCnTt = "Burundi", SnLtDnTt = " Capital : Gitega" },
                new SnItem { SnItId = "29", SnItTt = "Cabo Verde", SnLtCyTt = "Africa", SnLtCnTt = "Cabo Verde", SnLtDnTt = " Capital : Praia" },
                new SnItem { SnItId = "30", SnItTt = "Cambodia", SnLtCyTt = "Asia", SnLtCnTt = "Cambodia", SnLtDnTt = " Capital : Phnom Penh" },
                new SnItem { SnItId = "31", SnItTt = "Cameroon", SnLtCyTt = "Africa", SnLtCnTt = "Cameroon", SnLtDnTt = " Capital : Yaoundé" },
                new SnItem { SnItId = "32", SnItTt = "Canada", SnLtCyTt = "North America", SnLtCnTt = "Canada", SnLtDnTt = " Capital : Ottawa" },
                new SnItem { SnItId = "33", SnItTt = "Central African Republic", SnLtCyTt = "Africa", SnLtCnTt = "Central African Republic", SnLtDnTt = " Capital : Bangui" },
                new SnItem { SnItId = "34", SnItTt = "Chad", SnLtCyTt = "Africa", SnLtCnTt = "Chad", SnLtDnTt = " Capital : N'Djamena" },
                new SnItem { SnItId = "35", SnItTt = "Chile", SnLtCyTt = "South America", SnLtCnTt = "Chile", SnLtDnTt = " Capital : Santiago" },
                new SnItem { SnItId = "36", SnItTt = "China", SnLtCyTt = "Asia", SnLtCnTt = "China", SnLtDnTt = " Capital : Beijing" },
                new SnItem { SnItId = "37", SnItTt = "Colombia", SnLtCyTt = "South America", SnLtCnTt = "Colombia", SnLtDnTt = " Capital : Bogotá" },
                new SnItem { SnItId = "38", SnItTt = "Comoros", SnLtCyTt = "Africa", SnLtCnTt = "Comoros", SnLtDnTt = " Capital : Moroni" },
                new SnItem { SnItId = "39", SnItTt = "Congo (Congo-Brazzaville)", SnLtCyTt = "Africa", SnLtCnTt = "Congo", SnLtDnTt = " Capital : Brazzaville" },
                new SnItem { SnItId = "40", SnItTt = "Congo (Democratic Republic of the)", SnLtCyTt = "Africa", SnLtCnTt = "Congo (DR)", SnLtDnTt = " Capital : Kinshasa" },
                new SnItem { SnItId = "41", SnItTt = "Costa Rica", SnLtCyTt = "North America", SnLtCnTt = "Costa Rica", SnLtDnTt = " Capital : San José" },
                new SnItem { SnItId = "42", SnItTt = "Croatia", SnLtCyTt = "Europe", SnLtCnTt = "Croatia", SnLtDnTt = " Capital : Zagreb" },
                new SnItem { SnItId = "43", SnItTt = "Cuba", SnLtCyTt = "North America", SnLtCnTt = "Cuba", SnLtDnTt = " Capital : Havana" },
                new SnItem { SnItId = "44", SnItTt = "Cyprus", SnLtCyTt = "Asia", SnLtCnTt = "Cyprus", SnLtDnTt = " Capital : Nicosia" },
                new SnItem { SnItId = "45", SnItTt = "Czech Republic", SnLtCyTt = "Europe", SnLtCnTt = "Czech Republic", SnLtDnTt = " Capital : Prague" },
                new SnItem { SnItId = "46", SnItTt = "Denmark", SnLtCyTt = "Europe", SnLtCnTt = "Denmark", SnLtDnTt = " Capital : Copenhagen" },
                new SnItem { SnItId = "47", SnItTt = "Djibouti", SnLtCyTt = "Africa", SnLtCnTt = "Djibouti", SnLtDnTt = " Capital : Djibouti" },
                new SnItem { SnItId = "48", SnItTt = "Dominica", SnLtCyTt = "North America", SnLtCnTt = "Dominica", SnLtDnTt = " Capital : Roseau" },
                new SnItem { SnItId = "49", SnItTt = "Dominican Republic", SnLtCyTt = "North America", SnLtCnTt = "Dominican Republic", SnLtDnTt = " Capital : Santo Domingo" },
                new SnItem { SnItId = "50", SnItTt = "East Timor", SnLtCyTt = "Asia", SnLtCnTt = "East Timor", SnLtDnTt = " Capital : Dili" },
                new SnItem { SnItId = "51", SnItTt = "Ecuador", SnLtCyTt = "South America", SnLtCnTt = "Ecuador", SnLtDnTt = " Capital : Quito" },
                new SnItem { SnItId = "52", SnItTt = "Egypt", SnLtCyTt = "Africa", SnLtCnTt = "Egypt", SnLtDnTt = " Capital : Cairo" },
                new SnItem { SnItId = "53", SnItTt = "El Salvador", SnLtCyTt = "North America", SnLtCnTt = "El Salvador", SnLtDnTt = " Capital : San Salvador" },
                new SnItem { SnItId = "54", SnItTt = "Equatorial Guinea", SnLtCyTt = "Africa", SnLtCnTt = "Equatorial Guinea", SnLtDnTt = " Capital : Malabo" },
                new SnItem { SnItId = "55", SnItTt = "Eritrea", SnLtCyTt = "Africa", SnLtCnTt = "Eritrea", SnLtDnTt = " Capital : Asmara" },
                new SnItem { SnItId = "56", SnItTt = "Estonia", SnLtCyTt = "Europe", SnLtCnTt = "Estonia", SnLtDnTt = " Capital : Tallinn" },
                new SnItem { SnItId = "57", SnItTt = "Eswatini", SnLtCyTt = "Africa", SnLtCnTt = "Eswatini", SnLtDnTt = " Capital : Mbabane" },
                new SnItem { SnItId = "58", SnItTt = "Ethiopia", SnLtCyTt = "Africa", SnLtCnTt = "Ethiopia", SnLtDnTt = " Capital : Addis Ababa" },
                new SnItem { SnItId = "59", SnItTt = "Fiji", SnLtCyTt = "Oceania", SnLtCnTt = "Fiji", SnLtDnTt = " Capital : Suva" },
                new SnItem { SnItId = "60", SnItTt = "Finland", SnLtCyTt = "Europe", SnLtCnTt = "Finland", SnLtDnTt = " Capital : Helsinki" },
                new SnItem { SnItId = "61", SnItTt = "France", SnLtCyTt = "Europe", SnLtCnTt = "France", SnLtDnTt = " Capital : Paris" },
                new SnItem { SnItId = "62", SnItTt = "Gabon", SnLtCyTt = "Africa", SnLtCnTt = "Gabon", SnLtDnTt = " Capital : Libreville" },
                new SnItem { SnItId = "63", SnItTt = "Gambia", SnLtCyTt = "Africa", SnLtCnTt = "Gambia", SnLtDnTt = " Capital : Banjul" },
                new SnItem { SnItId = "64", SnItTt = "Georgia", SnLtCyTt = "Asia", SnLtCnTt = "Georgia", SnLtDnTt = " Capital : Tbilisi" },
                new SnItem { SnItId = "65", SnItTt = "Germany", SnLtCyTt = "Europe", SnLtCnTt = "Germany", SnLtDnTt = " Capital : Berlin" },
                new SnItem { SnItId = "66", SnItTt = "Ghana", SnLtCyTt = "Africa", SnLtCnTt = "Ghana", SnLtDnTt = " Capital : Accra" },
                new SnItem { SnItId = "67", SnItTt = "Greece", SnLtCyTt = "Europe", SnLtCnTt = "Greece", SnLtDnTt = " Capital : Athens" },
                new SnItem { SnItId = "68", SnItTt = "Grenada", SnLtCyTt = "North America", SnLtCnTt = "Grenada", SnLtDnTt = " Capital : Saint George's" },
                new SnItem { SnItId = "69", SnItTt = "Guatemala", SnLtCyTt = "North America", SnLtCnTt = "Guatemala", SnLtDnTt = " Capital : Guatemala City" },
                new SnItem { SnItId = "70", SnItTt = "Guinea", SnLtCyTt = "Africa", SnLtCnTt = "Guinea", SnLtDnTt = " Capital : Conakry" },
                new SnItem { SnItId = "71", SnItTt = "Guinea-Bissau", SnLtCyTt = "Africa", SnLtCnTt = "Guinea-Bissau", SnLtDnTt = " Capital : Bissau" },
                new SnItem { SnItId = "72", SnItTt = "Guyana", SnLtCyTt = "South America", SnLtCnTt = "Guyana", SnLtDnTt = " Capital : Georgetown" },
                new SnItem { SnItId = "73", SnItTt = "Haiti", SnLtCyTt = "North America", SnLtCnTt = "Haiti", SnLtDnTt = " Capital : Port-au-Prince" },
                new SnItem { SnItId = "74", SnItTt = "Honduras", SnLtCyTt = "North America", SnLtCnTt = "Honduras", SnLtDnTt = " Capital : Tegucigalpa" },
                new SnItem { SnItId = "75", SnItTt = "Hungary", SnLtCyTt = "Europe", SnLtCnTt = "Hungary", SnLtDnTt = " Capital : Budapest" },
                new SnItem { SnItId = "76", SnItTt = "Iceland", SnLtCyTt = "Europe", SnLtCnTt = "Iceland", SnLtDnTt = " Capital : Reykjavik" },
                new SnItem { SnItId = "77", SnItTt = "India", SnLtCyTt = "Asia", SnLtCnTt = "India", SnLtDnTt = " Capital : New Delhi" },
                new SnItem { SnItId = "78", SnItTt = "Indonesia", SnLtCyTt = "Asia", SnLtCnTt = "Indonesia", SnLtDnTt = " Capital : Jakarta" },
                new SnItem { SnItId = "79", SnItTt = "Iran", SnLtCyTt = "Asia", SnLtCnTt = "Iran", SnLtDnTt = " Capital : Tehran" },
                new SnItem { SnItId = "80", SnItTt = "Iraq", SnLtCyTt = "Asia", SnLtCnTt = "Iraq", SnLtDnTt = " Capital : Baghdad" },
                new SnItem { SnItId = "81", SnItTt = "Ireland", SnLtCyTt = "Europe", SnLtCnTt = "Ireland", SnLtDnTt = " Capital : Dublin" },
                new SnItem { SnItId = "82", SnItTt = "Israel", SnLtCyTt = "Asia", SnLtCnTt = "Israel", SnLtDnTt = " Capital : Jerusalem" },
                new SnItem { SnItId = "83", SnItTt = "Italy", SnLtCyTt = "Europe", SnLtCnTt = "Italy", SnLtDnTt = " Capital : Rome" },
                new SnItem { SnItId = "84", SnItTt = "Jamaica", SnLtCyTt = "North America", SnLtCnTt = "Jamaica", SnLtDnTt = " Capital : Kingston" },
                new SnItem { SnItId = "85", SnItTt = "Japan", SnLtCyTt = "Asia", SnLtCnTt = "Japan", SnLtDnTt = " Capital : Tokyo" },
                new SnItem { SnItId = "86", SnItTt = "Jordan", SnLtCyTt = "Asia", SnLtCnTt = "Jordan", SnLtDnTt = " Capital : Amman" },
                new SnItem { SnItId = "86", SnItTt = "Jordan", SnLtCyTt = "Asia", SnLtCnTt = "Jordan", SnLtDnTt = " Capital : Amman" },
                new SnItem { SnItId = "87", SnItTt = "Kazakhstan", SnLtCyTt = "Asia", SnLtCnTt = "Kazakhstan", SnLtDnTt = " Capital : Astana" },
                new SnItem { SnItId = "88", SnItTt = "Kenya", SnLtCyTt = "Africa", SnLtCnTt = "Kenya", SnLtDnTt = " Capital : Nairobi" },
                new SnItem { SnItId = "89", SnItTt = "Kiribati", SnLtCyTt = "Oceania", SnLtCnTt = "Kiribati", SnLtDnTt = " Capital : South Tarawa" },
                new SnItem { SnItId = "90", SnItTt = "Kuwait", SnLtCyTt = "Asia", SnLtCnTt = "Kuwait", SnLtDnTt = " Capital : Kuwait City" },
                new SnItem { SnItId = "91", SnItTt = "Kyrgyzstan", SnLtCyTt = "Asia", SnLtCnTt = "Kyrgyzstan", SnLtDnTt = " Capital : Bishkek" },
                new SnItem { SnItId = "92", SnItTt = "Laos", SnLtCyTt = "Asia", SnLtCnTt = "Laos", SnLtDnTt = " Capital : Vientiane" },
                new SnItem { SnItId = "93", SnItTt = "Latvia", SnLtCyTt = "Europe", SnLtCnTt = "Latvia", SnLtDnTt = " Capital : Riga" },
                new SnItem { SnItId = "94", SnItTt = "Lebanon", SnLtCyTt = "Asia", SnLtCnTt = "Lebanon", SnLtDnTt = " Capital : Beirut" },
                new SnItem { SnItId = "95", SnItTt = "Lesotho", SnLtCyTt = "Africa", SnLtCnTt = "Lesotho", SnLtDnTt = " Capital : Maseru" },
                new SnItem { SnItId = "96", SnItTt = "Liberia", SnLtCyTt = "Africa", SnLtCnTt = "Liberia", SnLtDnTt = " Capital : Monrovia" },
                new SnItem { SnItId = "97", SnItTt = "Libya", SnLtCyTt = "Africa", SnLtCnTt = "Libya", SnLtDnTt = " Capital : Tripoli" },
                new SnItem { SnItId = "98", SnItTt = "Liechtenstein", SnLtCyTt = "Europe", SnLtCnTt = "Liechtenstein", SnLtDnTt = " Capital : Vaduz" },
                new SnItem { SnItId = "99", SnItTt = "Lithuania", SnLtCyTt = "Europe", SnLtCnTt = "Lithuania", SnLtDnTt = " Capital : Vilnius" },
                new SnItem { SnItId = "100", SnItTt = "Luxembourg", SnLtCyTt = "Europe", SnLtCnTt = "Luxembourg", SnLtDnTt = " Capital : Luxembourg" },
                new SnItem { SnItId = "101", SnItTt = "Madagascar", SnLtCyTt = "Africa", SnLtCnTt = "Madagascar", SnLtDnTt = " Capital : Antananarivo" },
                new SnItem { SnItId = "102", SnItTt = "Malawi", SnLtCyTt = "Africa", SnLtCnTt = "Malawi", SnLtDnTt = " Capital : Lilongwe" },
                new SnItem { SnItId = "103", SnItTt = "Malaysia", SnLtCyTt = "Asia", SnLtCnTt = "Malaysia", SnLtDnTt = " Capital : Kuala Lumpur" },
                new SnItem { SnItId = "104", SnItTt = "Maldives", SnLtCyTt = "Asia", SnLtCnTt = "Maldives", SnLtDnTt = " Capital : Malé" },
                new SnItem { SnItId = "105", SnItTt = "Mali", SnLtCyTt = "Africa", SnLtCnTt = "Mali", SnLtDnTt = " Capital : Bamako" },
                new SnItem { SnItId = "106", SnItTt = "Malta", SnLtCyTt = "Europe", SnLtCnTt = "Malta", SnLtDnTt = " Capital : Valletta" },
                new SnItem { SnItId = "107", SnItTt = "Marshall Islands", SnLtCyTt = "Oceania", SnLtCnTt = "Marshall Islands", SnLtDnTt = " Capital : Majuro" },
                new SnItem { SnItId = "108", SnItTt = "Mauritania", SnLtCyTt = "Africa", SnLtCnTt = "Mauritania", SnLtDnTt = " Capital : Nouakchott" },
                new SnItem { SnItId = "109", SnItTt = "Mauritius", SnLtCyTt = "Africa", SnLtCnTt = "Mauritius", SnLtDnTt = " Capital : Port Louis" },
                new SnItem { SnItId = "110", SnItTt = "Mexico", SnLtCyTt = "North America", SnLtCnTt = "Mexico", SnLtDnTt = " Capital : Mexico City" },
                new SnItem { SnItId = "111", SnItTt = "Micronesia", SnLtCyTt = "Oceania", SnLtCnTt = "Micronesia", SnLtDnTt = " Capital : Palikir" },
                new SnItem { SnItId = "112", SnItTt = "Moldova", SnLtCyTt = "Europe", SnLtCnTt = "Moldova", SnLtDnTt = " Capital : Chișinău" },
                new SnItem { SnItId = "113", SnItTt = "Monaco", SnLtCyTt = "Europe", SnLtCnTt = "Monaco", SnLtDnTt = " Capital : Monaco" },
                new SnItem { SnItId = "114", SnItTt = "Mongolia", SnLtCyTt = "Asia", SnLtCnTt = "Mongolia", SnLtDnTt = " Capital : Ulaanbaatar" },
                new SnItem { SnItId = "115", SnItTt = "Montenegro", SnLtCyTt = "Europe", SnLtCnTt = "Montenegro", SnLtDnTt = " Capital : Podgorica" },
                new SnItem { SnItId = "116", SnItTt = "Morocco", SnLtCyTt = "Africa", SnLtCnTt = "Morocco", SnLtDnTt = " Capital : Rabat" },
                new SnItem { SnItId = "117", SnItTt = "Mozambique", SnLtCyTt = "Africa", SnLtCnTt = "Mozambique", SnLtDnTt = " Capital : Maputo" },
                new SnItem { SnItId = "118", SnItTt = "Myanmar", SnLtCyTt = "Asia", SnLtCnTt = "Myanmar", SnLtDnTt = " Capital : Naypyidaw" },
                new SnItem { SnItId = "119", SnItTt = "Namibia", SnLtCyTt = "Africa", SnLtCnTt = "Namibia", SnLtDnTt = " Capital : Windhoek" },
                new SnItem { SnItId = "120", SnItTt = "Nauru", SnLtCyTt = "Oceania", SnLtCnTt = "Nauru", SnLtDnTt = " Capital : Yaren District (de facto)" },
                new SnItem { SnItId = "121", SnItTt = "Nepal", SnLtCyTt = "Asia", SnLtCnTt = "Nepal", SnLtDnTt = " Capital : Kathmandu" },
                new SnItem { SnItId = "122", SnItTt = "Netherlands", SnLtCyTt = "Europe", SnLtCnTt = "Netherlands", SnLtDnTt = " Capital : Amsterdam" },
                new SnItem { SnItId = "123", SnItTt = "New Zealand", SnLtCyTt = "Oceania", SnLtCnTt = "New Zealand", SnLtDnTt = " Capital : Wellington" },
                new SnItem { SnItId = "124", SnItTt = "Nicaragua", SnLtCyTt = "North America", SnLtCnTt = "Nicaragua", SnLtDnTt = " Capital : Managua" },
                new SnItem { SnItId = "125", SnItTt = "Niger", SnLtCyTt = "Africa", SnLtCnTt = "Niger", SnLtDnTt = " Capital : Niamey" },
                new SnItem { SnItId = "126", SnItTt = "Nigeria", SnLtCyTt = "Africa", SnLtCnTt = "Nigeria", SnLtDnTt = " Capital : Abuja" },
                new SnItem { SnItId = "127", SnItTt = "North Korea", SnLtCyTt = "Asia", SnLtCnTt = "North Korea", SnLtDnTt = " Capital : Pyongyang" },
                new SnItem { SnItId = "128", SnItTt = "North Macedonia", SnLtCyTt = "Europe", SnLtCnTt = "North Macedonia", SnLtDnTt = " Capital : Skopje" },
                new SnItem { SnItId = "129", SnItTt = "Norway", SnLtCyTt = "Europe", SnLtCnTt = "Norway", SnLtDnTt = " Capital : Oslo" },
                new SnItem { SnItId = "130", SnItTt = "Oman", SnLtCyTt = "Asia", SnLtCnTt = "Oman", SnLtDnTt = " Capital : Muscat" },
                new SnItem { SnItId = "131", SnItTt = "Pakistan", SnLtCyTt = "Asia", SnLtCnTt = "Pakistan", SnLtDnTt = " Capital : Islamabad" },
                new SnItem { SnItId = "132", SnItTt = "Palau", SnLtCyTt = "Oceania", SnLtCnTt = "Palau", SnLtDnTt = " Capital : Ngerulmud" },
                new SnItem { SnItId = "133", SnItTt = "Panama", SnLtCyTt = "North America", SnLtCnTt = "Panama", SnLtDnTt = " Capital : Panama City" },
                new SnItem { SnItId = "134", SnItTt = "Papua New Guinea", SnLtCyTt = "Oceania", SnLtCnTt = "Papua New Guinea", SnLtDnTt = " Capital : Port Moresby" },
                new SnItem { SnItId = "135", SnItTt = "Paraguay", SnLtCyTt = "South America", SnLtCnTt = "Paraguay", SnLtDnTt = " Capital : Asunción" },
                new SnItem { SnItId = "136", SnItTt = "Peru", SnLtCyTt = "South America", SnLtCnTt = "Peru", SnLtDnTt = " Capital : Lima" },
                new SnItem { SnItId = "137", SnItTt = "Philippines", SnLtCyTt = "Asia", SnLtCnTt = "Philippines", SnLtDnTt = " Capital : Manila" },
                new SnItem { SnItId = "138", SnItTt = "Poland", SnLtCyTt = "Europe", SnLtCnTt = "Poland", SnLtDnTt = " Capital : Warsaw" },
                new SnItem { SnItId = "139", SnItTt = "Portugal", SnLtCyTt = "Europe", SnLtCnTt = "Portugal", SnLtDnTt = " Capital : Lisbon" },
                new SnItem { SnItId = "140", SnItTt = "Qatar", SnLtCyTt = "Asia", SnLtCnTt = "Qatar", SnLtDnTt = " Capital : Doha" },
                new SnItem { SnItId = "141", SnItTt = "Romania", SnLtCyTt = "Europe", SnLtCnTt = "Romania", SnLtDnTt = " Capital : Bucharest" },
                new SnItem { SnItId = "142", SnItTt = "Russia", SnLtCyTt = "Europe", SnLtCnTt = "Russia", SnLtDnTt = " Capital : Moscow" },
                new SnItem { SnItId = "143", SnItTt = "Rwanda", SnLtCyTt = "Africa", SnLtCnTt = "Rwanda", SnLtDnTt = " Capital : Kigali" },
                new SnItem { SnItId = "144", SnItTt = "Saint Kitts and Nevis", SnLtCyTt = "North America", SnLtCnTt = "Saint Kitts and Nevis", SnLtDnTt = " Capital : Basseterre" },
                new SnItem { SnItId = "145", SnItTt = "Saint Lucia", SnLtCyTt = "North America", SnLtCnTt = "Saint Lucia", SnLtDnTt = " Capital : Castries" },
                new SnItem { SnItId = "146", SnItTt = "Saint Vincent and the Grenadines", SnLtCyTt = "North America", SnLtCnTt = "Saint Vincent and the Grenadines", SnLtDnTt = " Capital : Kingstown" },
                new SnItem { SnItId = "147", SnItTt = "Samoa", SnLtCyTt = "Oceania", SnLtCnTt = "Samoa", SnLtDnTt = " Capital : Apia" },
                new SnItem { SnItId = "148", SnItTt = "San Marino", SnLtCyTt = "Europe", SnLtCnTt = "San Marino", SnLtDnTt = " Capital : San Marino" },
                new SnItem { SnItId = "149", SnItTt = "Sao Tome and Principe", SnLtCyTt = "Africa", SnLtCnTt = "Sao Tome and Principe", SnLtDnTt = " Capital : São Tomé" },
                new SnItem { SnItId = "150", SnItTt = "Saudi Arabia", SnLtCyTt = "Asia", SnLtCnTt = "Saudi Arabia", SnLtDnTt = " Capital : Riyadh" },
                new SnItem { SnItId = "151", SnItTt = "Senegal", SnLtCyTt = "Africa", SnLtCnTt = "Senegal", SnLtDnTt = " Capital : Dakar" },
                new SnItem { SnItId = "152", SnItTt = "Serbia", SnLtCyTt = "Europe", SnLtCnTt = "Serbia", SnLtDnTt = " Capital : Belgrade" },
                new SnItem { SnItId = "153", SnItTt = "Seychelles", SnLtCyTt = "Africa", SnLtCnTt = "Seychelles", SnLtDnTt = " Capital : Victoria" },
                new SnItem { SnItId = "154", SnItTt = "Sierra Leone", SnLtCyTt = "Africa", SnLtCnTt = "Sierra Leone", SnLtDnTt = " Capital : Freetown" },
                new SnItem { SnItId = "155", SnItTt = "Singapore", SnLtCyTt = "Asia", SnLtCnTt = "Singapore", SnLtDnTt = " Capital : Singapore" },
                new SnItem { SnItId = "156", SnItTt = "Slovakia", SnLtCyTt = "Europe", SnLtCnTt = "Slovakia", SnLtDnTt = " Capital : Bratislava" },
                new SnItem { SnItId = "157", SnItTt = "Slovenia", SnLtCyTt = "Europe", SnLtCnTt = "Slovenia", SnLtDnTt = " Capital : Ljubljana" },
                new SnItem { SnItId = "158", SnItTt = "Solomon Islands", SnLtCyTt = "Oceania", SnLtCnTt = "Solomon Islands", SnLtDnTt = " Capital : Honiara" },
                new SnItem { SnItId = "159", SnItTt = "Somalia", SnLtCyTt = "Africa", SnLtCnTt = "Somalia", SnLtDnTt = " Capital : Mogadishu" },
                new SnItem { SnItId = "160", SnItTt = "South Africa", SnLtCyTt = "Africa", SnLtCnTt = "South Africa", SnLtDnTt = " Capital : Pretoria" },
                new SnItem { SnItId = "161", SnItTt = "South Korea", SnLtCyTt = "Asia", SnLtCnTt = "South Korea", SnLtDnTt = " Capital : Seoul" },
                new SnItem { SnItId = "162", SnItTt = "South Sudan", SnLtCyTt = "Africa", SnLtCnTt = "South Sudan", SnLtDnTt = " Capital : Juba" },
                new SnItem { SnItId = "163", SnItTt = "Spain", SnLtCyTt = "Europe", SnLtCnTt = "Spain", SnLtDnTt = " Capital : Madrid" },
                new SnItem { SnItId = "164", SnItTt = "Sri Lanka", SnLtCyTt = "Asia", SnLtCnTt = "Sri Lanka", SnLtDnTt = " Capital : Sri Jayawardenepura Kotte" },
                new SnItem { SnItId = "165", SnItTt = "Sudan", SnLtCyTt = "Africa", SnLtCnTt = "Sudan", SnLtDnTt = " Capital : Khartoum" },
                new SnItem { SnItId = "166", SnItTt = "Suriname", SnLtCyTt = "South America", SnLtCnTt = "Suriname", SnLtDnTt = " Capital : Paramaribo" },
                new SnItem { SnItId = "167", SnItTt = "Sweden", SnLtCyTt = "Europe", SnLtCnTt = "Sweden", SnLtDnTt = " Capital : Stockholm" },
                new SnItem { SnItId = "168", SnItTt = "Switzerland", SnLtCyTt = "Europe", SnLtCnTt = "Switzerland", SnLtDnTt = " Capital : Bern" },
                new SnItem { SnItId = "169", SnItTt = "Syria", SnLtCyTt = "Asia", SnLtCnTt = "Syria", SnLtDnTt = " Capital : Damascus" },
                new SnItem { SnItId = "170", SnItTt = "Taiwan", SnLtCyTt = "Asia", SnLtCnTt = "Taiwan", SnLtDnTt = " Capital : Taipei" },
                new SnItem { SnItId = "171", SnItTt = "Tajikistan", SnLtCyTt = "Asia", SnLtCnTt = "Tajikistan", SnLtDnTt = " Capital : Dushanbe" },
                new SnItem { SnItId = "172", SnItTt = "Tanzania", SnLtCyTt = "Africa", SnLtCnTt = "Tanzania", SnLtDnTt = " Capital : Dodoma" },
                new SnItem { SnItId = "173", SnItTt = "Thailand", SnLtCyTt = "Asia", SnLtCnTt = "Thailand", SnLtDnTt = " Capital : Bangkok" },
                new SnItem { SnItId = "174", SnItTt = "Togo", SnLtCyTt = "Africa", SnLtCnTt = "Togo", SnLtDnTt = " Capital : Lomé" },
                new SnItem { SnItId = "175", SnItTt = "Tonga", SnLtCyTt = "Oceania", SnLtCnTt = "Tonga", SnLtDnTt = " Capital : Nukuʻalofa" },
                new SnItem { SnItId = "176", SnItTt = "Trinidad and Tobago", SnLtCyTt = "North America", SnLtCnTt = "Trinidad and Tobago", SnLtDnTt = " Capital : Port of Spain" },
                new SnItem { SnItId = "177", SnItTt = "Tunisia", SnLtCyTt = "Africa", SnLtCnTt = "Tunisia", SnLtDnTt = " Capital : Tunis" },
                new SnItem { SnItId = "178", SnItTt = "Turkey", SnLtCyTt = "Asia", SnLtCnTt = "Turkey", SnLtDnTt = " Capital : Ankara" },
                new SnItem { SnItId = "179", SnItTt = "Turkmenistan", SnLtCyTt = "Asia", SnLtCnTt = "Turkmenistan", SnLtDnTt = " Capital : Ashgabat" },
                new SnItem { SnItId = "180", SnItTt = "Tuvalu", SnLtCyTt = "Oceania", SnLtCnTt = "Tuvalu", SnLtDnTt = " Capital : Funafuti" },
                new SnItem { SnItId = "181", SnItTt = "Uganda", SnLtCyTt = "Africa", SnLtCnTt = "Uganda", SnLtDnTt = " Capital : Kampala" },
                new SnItem { SnItId = "182", SnItTt = "Ukraine", SnLtCyTt = "Europe", SnLtCnTt = "Ukraine", SnLtDnTt = " Capital : Kyiv" },
                new SnItem { SnItId = "183", SnItTt = "United Arab Emirates", SnLtCyTt = "Asia", SnLtCnTt = "United Arab Emirates", SnLtDnTt = " Capital : Abu Dhabi" },
                new SnItem { SnItId = "184", SnItTt = "United Kingdom", SnLtCyTt = "Europe", SnLtCnTt = "United Kingdom", SnLtDnTt = " Capital : London" },
                new SnItem { SnItId = "185", SnItTt = "United States", SnLtCyTt = "North America", SnLtCnTt = "United States", SnLtDnTt = " Capital : Washington, D.C." },
                new SnItem { SnItId = "186", SnItTt = "Uruguay", SnLtCyTt = "South America", SnLtCnTt = "Uruguay", SnLtDnTt = " Capital : Montevideo" },
                new SnItem { SnItId = "187", SnItTt = "Uzbekistan", SnLtCyTt = "Asia", SnLtCnTt = "Uzbekistan", SnLtDnTt = " Capital : Tashkent" },
                new SnItem { SnItId = "188", SnItTt = "Vanuatu", SnLtCyTt = "Oceania", SnLtCnTt = "Vanuatu", SnLtDnTt = " Capital : Port Vila" },
                new SnItem { SnItId = "189", SnItTt = "Vatican City", SnLtCyTt = "Europe", SnLtCnTt = "Vatican City", SnLtDnTt = " Capital : Vatican City" },
                new SnItem { SnItId = "190", SnItTt = "Venezuela", SnLtCyTt = "South America", SnLtCnTt = "Venezuela", SnLtDnTt = " Capital : Caracas" },
                new SnItem { SnItId = "191", SnItTt = "Vietnam", SnLtCyTt = "Asia", SnLtCnTt = "Vietnam", SnLtDnTt = " Capital : Hanoi" },
                new SnItem { SnItId = "192", SnItTt = "Yemen", SnLtCyTt = "Asia", SnLtCnTt = "Yemen", SnLtDnTt = " Capital : Sana'a" },
                new SnItem { SnItId = "193", SnItTt = "Zambia", SnLtCyTt = "Africa", SnLtCnTt = "Zambia", SnLtDnTt = " Capital : Lusaka" },
                new SnItem { SnItId = "194", SnItTt = "Zimbabwe", SnLtCyTt = "Africa", SnLtCnTt = "Zimbabwe", SnLtDnTt = " Capital : Harare" }

            };
            return data;

        }
        public Task<JsonResult> SearchCn(string term)
        {
            var data = Data();
            var finalData = data
                .Where(x => (x.SnItTt ?? "").Contains(term, StringComparison.OrdinalIgnoreCase))
                .Select(x => new
                {
                    SnItId = x.SnItId,
                    SnItTt = x.SnItTt ?? "",  // Ensure it's never null
                    SnLtCnTt = x.SnLtCnTt ?? ""
                })
                .ToList();

            return Task.FromResult(Json(finalData));
        }
        public Task<JsonResult> SearchCnIn(string term)
        {
            var data = Data();
            var finalData = data
                .Where(x => (x.SnItTt ?? "").Contains(term, StringComparison.OrdinalIgnoreCase))
                .Select(x => new
                {
                    SnItId = x.SnItId,
                    SnItTt = x.SnItTt ?? "",  // Ensure it's never null
                    SnLtCnTt = x.SnLtCnTt ?? "",
                    SnLtInCs = "CT-FilterTriangel"
                })
                .ToList();

            return Task.FromResult(Json(finalData));

        }
        public Task<JsonResult> SearchCnInDn(string term)
        {
            var data = Data();
            var finalData = data
                .Where(x => (x.SnItTt ?? "").Contains(term, StringComparison.OrdinalIgnoreCase))
                .Select(x => new
                {
                    SnItId = x.SnItId,
                    SnItTt = x.SnItTt ?? "",  // Ensure it's never null
                    SnLtCnTt = x.SnLtCnTt ?? "",
                    SnLtInCs = "CT-FilterTriangel",
                    SnLtDnTt = x.SnLtDnTt ?? ""  // Ensure it's never null
                })
                .ToList();

            return Task.FromResult(Json(finalData));
        }
        public Task<JsonResult> SearchCnInDnCy(string term)
        {
            var data = Data();
            var finalData = data
                .Where(x => (x.SnItTt ?? "").Contains(term, StringComparison.OrdinalIgnoreCase)) // Prevents NullReferenceException
                .Select(x => new
                {
                    SnItId = x.SnItId,
                    SnItTt = x.SnItTt ?? "",   // Ensure it's never null
                    SnLtCyTt = x.SnLtCyTt ?? "",
                    SnLtCnTt = x.SnLtCnTt ?? "",
                    SnLtDnTt = x.SnLtDnTt ?? "",
                    SnLtInCs = "CT-FilterTriangel"
                })
                .ToList();

            return Task.FromResult(Json(finalData));

        }
        public Task<JsonResult> SearchContinent(string term, string AgContinent)
        {
            var data = Data();
            var finalData = data
                .Where(x => (x.SnItTt ?? "").Contains(term, StringComparison.OrdinalIgnoreCase) &&
                            (x.SnLtCyTt ?? "") == (AgContinent ?? ""))
                .Select(x => new
                {
                    SnItId = x.SnItId,
                    SnItTt = x.SnItTt ?? "",   // Ensure it's never null
                    SnLtCyTt = x.SnLtCyTt ?? "",
                    SnLtCnTt = x.SnLtCnTt ?? "",
                    SnLtDnTt = x.SnLtDnTt ?? "",
                    SnLtInCs = "CT-FilterTriangel"
                })
                .ToList();

            return Task.FromResult(Json(finalData));

        }
    }
}
